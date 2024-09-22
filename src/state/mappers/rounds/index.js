import { isEmpty, get, toLower } from 'lodash'
import { toDecimalERC20, toDecimalPricefeed } from '@oracly/pm-libs/calc-utils'
import { nowUnixTS } from '@oracly/pm-libs/date-utils'
import { keccak256 } from '@oracly/pm-libs/hash-utils'

import { ERC20, PRIZEFUNDS, UNIX_DAY } from '@constants'

export function toActualRoundId(game) {

  const { gameid, schedule } = game

  const now = nowUnixTS()
  const sinceStart = now % schedule
  const startDate = now - sinceStart

  const roundid = keccak256([gameid, startDate], ['bytes32', 'uint256'])

  return roundid
}

export function toActualRound(game) {

  if (isEmpty(game)) return null

  const { gameid, pricefeed, positioning, schedule, erc20 } = game

  const now = nowUnixTS()
  const sinceStart = now % schedule
  const startDate = now - sinceStart
  const endDate = startDate + schedule
  const lockDate = startDate + positioning
  // TODO: remove fallback 24h, UNIX_DAY expiration date
  // as soon as it's impelemnted on backend
  const expirationDate = endDate + (game.expiration || UNIX_DAY)

  const roundid = toActualRoundId(game)

  const round = {
    roundid,
    gameid,
    erc20,
    pricefeed,
    startDate,
    lockDate,
    endDate,
    expirationDate,

    resolved: false,
    archived: false,
    phantom: true,

    predictions: 0,
    bettors: 0,

    prizefunds: {
      [PRIZEFUNDS.UP]: '0',
      [PRIZEFUNDS.DOWN]: '0',
      [PRIZEFUNDS.EQUAL]: '0',
      [PRIZEFUNDS.TOTAL]: '0',
    }
  }

  return round

}

export const ROUND_BC = {
  'roundid'     :   '0',
  'gameid'      :   '1',
  'resolution'  :   '2',
  'entryPrice' :   {
    'value'       : '3.0',
    'timestamp'   : '3.1',
    'roundid'     : '3.2',
  },
  'exitPrice' : {
    'value'       : '4.0',
    'timestamp'   : '4.1',
    'roundid'     : '4.2',
  },
  'startDate'       :   '5',
  'lockDate'        :   '6',
  'endDate'         :   '7',
  'expirationDate'  :   '8',
  'resolved'        :   '9',
  'resolvedAt'      :   '10',
  'openedAt'        :   '11',
  'erc20'           :   '12',
  'pricefeed'       :   '13',
  'archived'        :   '14',
  'archivedAt'      :   '15',
}

const BC_TOTAL_IDX = 0

export const blockchain2Round = (round, bcround, bcprizefunds, bcbettors, bcpredictions, blocknumber) => {

  if (isEmpty(bcround)) return round

  blocknumber = Number(blocknumber)
  if (!blocknumber) return round

  const entityblock = Number(round?.blockNumber)
  if (!entityblock || entityblock < blocknumber) {
    if (!isEmpty(round) && !entityblock) console.warn('[override] entityBlock is empty for existing entity') // eslint-disable-line

    round = { ...round }

    round.blockNumber = blocknumber

    round.roundid = toLower(get(bcround, ROUND_BC.roundid))
    round.gameid = toLower(get(bcround, ROUND_BC.gameid))

    round.erc20 = toLower(get(bcround, ROUND_BC.erc20))
    round.pricefeed = toLower(get(bcround, ROUND_BC.pricefeed))

    round.startDate = Number(get(bcround, ROUND_BC.startDate))
    round.lockDate = Number(get(bcround, ROUND_BC.lockDate))

    round.entryPriceRoundid = String(get(bcround, ROUND_BC.entryPrice.roundid))
    round.entryPriceTimestamp = Number(get(bcround, ROUND_BC.entryPrice.timestamp))
    round.entryPriceValue = toDecimalPricefeed(Number(get(bcround, ROUND_BC.entryPrice.value)), round.pricefeed)

    round.openedAt = Number(get(bcround, ROUND_BC.openedAt))

    round.openTransactionHash = round.openTransactionHash
    round.openedBy = round.openedBy

    round.resolution = Number(get(bcround, ROUND_BC.resolution))
    round.endDate = Number(get(bcround, ROUND_BC.endDate))

    round.expirationDate = Number(get(bcround, ROUND_BC.expirationDate)) || round.expirationDate

    round.exitPriceRoundid = get(bcround, ROUND_BC.exitPrice.roundid)
      ? String(get(bcround, ROUND_BC.exitPrice.roundid))
      : round.exitPriceRoundid

    round.exitPriceTimestamp = Number(get(bcround, ROUND_BC.exitPrice.timestamp)) || round.exitPriceTimestamp

    round.exitPriceValue = get(bcround, ROUND_BC.exitPrice.value)
      ? toDecimalPricefeed(Number(get(bcround, ROUND_BC.exitPrice.value)), round.pricefeed)
      : round.exitPriceValue

    round.resolutionTransactionHash = round.resolutionTransactionHash
    round.resolvedBy = round.resolvedBy

    round.resolved = Boolean(Number(get(bcround, ROUND_BC.resolved)))
    round.resolvedAt = Number(get(bcround, ROUND_BC.resolvedAt)) || round.resolvedAt

    round.archived = Boolean(Number(get(bcround, ROUND_BC.archived)))
    round.archivedAt = Number(get(bcround, ROUND_BC.archivedAt)) || round.archivedAt

    round.bettors = Number(get(bcbettors, BC_TOTAL_IDX)) || round.bettors
    round.predictions = Number(get(bcpredictions, BC_TOTAL_IDX)) || round.predictions

    round.prizefunds = {
      [PRIZEFUNDS.UP]: '0',
      [PRIZEFUNDS.DOWN]: '0',
      [PRIZEFUNDS.EQUAL]: '0',
      [PRIZEFUNDS.TOTAL]: '0',
    }
    round.currency = ERC20[round.erc20]

    bcprizefunds = normalizeBC(bcprizefunds)
    if (!isEmpty(bcprizefunds)) {
      for (const key in bcprizefunds) {
        round.prizefunds[key] = toDecimalERC20(bcprizefunds[key], round.erc20)
      }
    }

    round.phantom = false

  }

  return round
}

function normalizeBC(bcfunds) {
  if (isEmpty(bcfunds)) return bcfunds

  const normal = {
    [PRIZEFUNDS.UP]: bcfunds[PRIZEFUNDS.UP],
    [PRIZEFUNDS.DOWN]: bcfunds[PRIZEFUNDS.DOWN],
    [PRIZEFUNDS.EQUAL]: bcfunds[PRIZEFUNDS.EQUAL],
    [PRIZEFUNDS.TOTAL]: bcfunds[BC_TOTAL_IDX],
  }

  return normal
}
