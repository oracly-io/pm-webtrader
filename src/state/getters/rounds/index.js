import { isEmpty, pick, map, values, size, property } from 'lodash'
import { get } from '@oracly/pm-libs/immutable'

import { getPredictionById } from '@state/getters'
import { getClaimablePredictions } from '@state/getters'
import { getGameById } from '@state/getters/games'
import { toActualRound, toActualRoundId } from '@state/mappers'
import { isNeverPerformed } from '@state/getters'
import { READ_BLOCKCHAIN_ROUND_BY_ID } from '@actions'

export function getUpdatableRoundids(state, take) {

  const roundids = {}

  const claimableRoundids = map(getClaimablePredictions(state), property(['prediction', 'roundid']))
  for (const roundid of claimableRoundids) {
    if (Number(take) && Number(take) === size(roundids)) break

    if (isNeverPerformed(state, READ_BLOCKCHAIN_ROUND_BY_ID, roundid)) {
      roundids[roundid] = roundid
    }
  }

  const missingRoundids = getMissingRoundids(state)
  for (const roundid of missingRoundids) {
    if (Number(take) && Number(take) === size(roundids)) break

    roundids[roundid] = roundid
  }

  return values(roundids)
}

function _getRounds(state) {
  return get(state, ['rounds', 'collection'])
}

export function getRounds(state) {
  return _getRounds(state)
}

export function getRoundById(state, roundid) {
  return get(_getRounds(state), [roundid])
}

export function getRoundsByIds(state, roundids) {
  return pick(_getRounds(state), values(roundids))
}

export function getGameRoundids(state, gameid) {
  const roundids = get(state, ['rounds', '__idx__', 'gameid', gameid]) || {}
  return roundids
}

function getMissingRoundids(state) {
  const roundids = get(state, ['rounds', '__missing__', 'roundids']) || {}
  return values(roundids)
}

export function getActualRound(state, gameid) {
  const game = getGameById(state, gameid)
  if (isEmpty(game)) return {}

  const actual = toActualRound(game)
  return getRoundById(state, actual?.roundid) || actual
}

export function getActualRoundId(state, gameid) {
  const game = getGameById(state, gameid)
  if (isEmpty(game)) return ''

  const roundid = toActualRoundId(game)
  return roundid
}

export function getRoundByPredictionId(state, predictionid) {
  const prediction = getPredictionById(state, predictionid)
  if (isEmpty(prediction)) return null

  const round = getRoundById(state, prediction.roundid)
  if (!isEmpty(round)) return round

  const actualround = getActualRound(state, prediction.gameid)
  if (actualround.roundid === prediction.roundid) return actualround

  return null
}

export function getRoundsForChart(state, gameid) {
  const roundids = getGameRoundids(state, gameid)
  const roundsByIds = getRoundsByIds(state, roundids)

  // NOTE: adding phantom actualround if not exists
  // to pass data around during round not exists state
  const game = getGameById(state, gameid)
  const actualround = toActualRound(game)
  if (actualround?.roundid) {
    roundsByIds[actualround.roundid] = roundsByIds[actualround.roundid] || actualround
  }

  return roundsByIds
}

