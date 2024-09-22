import { keys, pick, filter, pickBy, isEmpty, orderBy, reduce, first } from 'lodash'
import { actualReturn } from '@oracly/pm-libs/calc-utils'
import { get } from '@oracly/pm-libs/immutable'

import { ERC20, NOCONTEST } from '@constants'
import { getActiveCurrency, getActiveGameId, getRoundById, getRoundByPredictionId } from '@state/getters'
import { getActiveAccountAddress, getLatestPriceByPricefeed } from '@state/getters'
import { getSettlmentById } from '@state/getters'
import { getRoundResolutionDynamic, isHistoricalRound, isNoContestEmptyRound } from '@utils'

const TOTAL_IDX = 0

export function getPredictionsByIds(state, predictionids) {
  return pick(getPredictions(state), predictionids)
}

export function getBettorPredictionIds(state, bettorid) {
  const predictionIds = keys(get(state, ['predictions', 'collection', '_idx_bettor', bettorid]))

  return predictionIds
}

function getBettorPredictions(state, bettorid) {
  const predictionids = getBettorPredictionIds(state, bettorid)
  const predictions = getPredictionsByIds(state, predictionids)
  return predictions
}

export function getBettorRoundPredictions(state, roundid, bettorid) {
  const predictions = getBettorPredictions(state, bettorid)
  return filter(predictions, { roundid })
}

// new

export function getPredictions(state) {
  return get(state, ['predictions', 'collection', 'hash'])
}

export function getPredictionById(state, id) {
  return get(getPredictions(state), [id])
}

export function getPredictionsByGameIdAndBettor(state, gameid, bettor) {
  // TODO: implemet indexator reducer __idx__
  // const predictionids = get(state, ['__idx__', 'prediction', 'gameid', gameid, 'bettorid', bettor])
  // const predictions = pick(getPredictions(state), predictionids)
  const predictions = pickBy(getPredictions(state), { gameid, bettor })

  return predictions
}

export function getPredictionsTotalSizeByAddress(state, bettor) {
  return Number(get(state, ['predictions', 'collection', 'prediction_by_address_size', bettor])) || 0
}

export function getPredictionsLoadedSizeByAddress(state, bettor) {
  const predictions = getBettorPredictions(state, bettor)

  return reduce(predictions, (count, prediction) => prediction.phantom ? count : count+1, 0)
}

export function getPredictionsListOffset(state, bettor) {
  const bcsize = getPredictionsTotalSizeByAddress(state, bettor)
  const predictionssize = getPredictionsLoadedSizeByAddress(state, bettor)

  return Math.min(predictionssize, bcsize)
}

export function getActiveGameBettorPredictions(state, bettor) {
  const gameid = getActiveGameId(state)
  if (!gameid) return {}

  const predictions = getPredictionsByGameIdAndBettor(state, gameid, bettor)

  return predictions
}

export function getRoundTopBettorPredictionIds(state, roundid, position = TOTAL_IDX) {
  return keys(get(state, ['predictions', 'top', 'rounds', roundid, position]))
}

export function getRoundTopBettorPredictions(state, roundid, position = TOTAL_IDX) {
  const predictionids = getRoundTopBettorPredictionIds(state, roundid, position)

  return pick(getPredictions(state), predictionids)
}

export function getRoundTopWinnerPredictions(state, roundid) {

  const round = getRoundById(state, roundid)
  if (isEmpty(round) || !round.resolved) return getRoundTopBettorPredictionIds(state, roundid)

  const predictionids = getRoundTopBettorPredictionIds(state, roundid, round.resolution)
  return pick(getPredictions(state), predictionids)
}

export function getPredictionsTotalSizeByRound(state, roundid, position = TOTAL_IDX) {
  return Number(get(state, ['predictions', 'collection', 'prediction_by_round_size', roundid, position])) || 0
}

export function getPredictionsLoadedSizeByRound(state, roundid, position = TOTAL_IDX) {
  const predictions = getRoundTopBettorPredictions(state, roundid, position)

  return reduce(predictions, (count, prediction) => prediction.phantom ? count : count+1, 0)
}

export function getTopPredictionsListOffset(state, roundid, position) {
  const bcsize = getPredictionsTotalSizeByRound(state, roundid, position)
  const predictionssize = getPredictionsLoadedSizeByRound(state, roundid, position)

  return Math.min(predictionssize, bcsize)
}

export function getPredictionsMissingRoundIds (state) {
  return get(state, ['predictions', 'collection', '__missing__', 'roundids'])
}

export function getClaimablePredictions(state, take) {
  const bettorid = getActiveAccountAddress(state)
  const predictionids = getBettorPredictionIds(state, bettorid)
  const predictions = getPredictionsByIds(state, predictionids)
  const currency = getActiveCurrency(state)

  let result = []
  for (const prediction of orderBy(predictions, 'priotiry', ['desc'])) {
    const round = getRoundByPredictionId(state, prediction.predictionid)

    if (isEmpty(round)) continue
    if (prediction.erc20 !== ERC20[currency]) continue

    const latestPrice = getLatestPriceByPricefeed(state, round.pricefeed)
    const settlment = getSettlmentById(state, round.pricefeed, round.endDate)
    const resolution = getRoundResolutionDynamic(round, latestPrice, settlment)
    const phantom = prediction.phantom
    const nocontest = resolution === NOCONTEST && !phantom
    const win = prediction.position === resolution && !phantom
    const isHistorical = isHistoricalRound(round, settlment)
    const won = win && isHistorical && !nocontest && !phantom
    const claimed = prediction.claimed
    const claimable = (won || nocontest) && !claimed

    if (claimable) {

      const emptyround = isNoContestEmptyRound(round)
      let prize = 0
      if (prediction.claimed) {
        prize = prediction.payout
      } else if (nocontest || emptyround) {
        prize = prediction.wager
      } else if (won) {
        prize = actualReturn(round.prizefunds, prediction.wager, prediction.position)
      }

      result.push({
        prediction,
        won,
        nocontest,
        prize,
      })

      if (take == result.length) break
    }

  }

  return result
}

export function getLastClaimablePrediction(state) {
  return first(getClaimablePredictions(state, 1)) || {}
}

