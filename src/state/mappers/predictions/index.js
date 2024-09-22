import { isEmpty, indexOf, toLower, get, curryRight } from 'lodash'
import { toDecimalERC20 } from '@oracly/pm-libs/calc-utils'
import { nowUnixTS } from '@oracly/pm-libs/date-utils'
import { keccak256 } from '@oracly/pm-libs/hash-utils'

import { ERC20, UP, DOWN, EQUAL } from '@constants'
import { blockchain2EntityMap } from '@utils'

export function createPrediction({ erc20, wager, gameid, roundid, account, position }) {
  return {
    predictionid: toPredictionId({ roundid, account, position }),
    priotiry: nowUnixTS(),
    bettor: account,
    erc20,
    wager: toDecimalERC20(wager, erc20),
    gameid,
    roundid,
    position,
    currency: ERC20[erc20],
    phantom: true,
  }
}

export function toPredictionPosition(outcome) {
  if (~indexOf(outcome, [UP, DOWN, EQUAL])) return null
  return outcome
}

export function toPredictionId({ roundid, account, position }) {
  if (!roundid || !account || !position) return null
  return keccak256([roundid, account, position], ['bytes32', 'address', 'uint8'])
}

export const PREDICTION_BC = {
  'predictionid' : '0',
  'roundid'      : '1',
  'gameid'       : '2',
  'bettor'       : '3',
  'position'     : '4',
  'wager'        : '5',
  'claimed'      : '6',
  'createdAt'    : '7',
  'payout'       : '8',
  'commission'   : '9',
  'erc20'        : '10',
}
export const blockchain2PredictionMap = curryRight(blockchain2EntityMap)(PREDICTION_BC)

export function blockchain2Prediction(prediction, bcprediction, blocknumber) {

  if (isEmpty(bcprediction)) return prediction

  blocknumber = Number(blocknumber)
  if (!blocknumber) return prediction

  const entityblock = Number(prediction?.blockNumber)
  if (!entityblock || entityblock < blocknumber) {

    prediction = { ...prediction }

    prediction.blockNumber = blocknumber

    prediction.erc20 = get(bcprediction, PREDICTION_BC.erc20) ? toLower(get(bcprediction, PREDICTION_BC.erc20)) : prediction.erc20
    prediction.gameid = get(bcprediction, PREDICTION_BC.gameid) ? toLower(get(bcprediction, PREDICTION_BC.gameid)) : prediction.gameid

    prediction.bettor = toLower(get(bcprediction, PREDICTION_BC.bettor))
    prediction.claimed = get(bcprediction, PREDICTION_BC.claimed)
    prediction.commission = get(bcprediction, PREDICTION_BC.commission)
      ? toDecimalERC20(String(get(bcprediction, PREDICTION_BC.commission)), prediction.erc20)
      : prediction.commission

    prediction.createdAt = Number(get(bcprediction, PREDICTION_BC.createdAt))
    prediction.priotiry = prediction.createdAt

    prediction.predictionid = toLower(get(bcprediction, PREDICTION_BC.predictionid))
    prediction.roundid = toLower(get(bcprediction, PREDICTION_BC.roundid))

    prediction.payout = get(bcprediction, PREDICTION_BC.payout)
      ? toDecimalERC20(String(get(bcprediction, PREDICTION_BC.payout)), prediction.erc20)
      : prediction.payout

    prediction.position = Number(get(bcprediction, PREDICTION_BC.position))

    prediction.wager = get(bcprediction, PREDICTION_BC.wager)
      ? toDecimalERC20(String(get(bcprediction, PREDICTION_BC.wager)), prediction.erc20)
      : prediction.wager

    prediction.currency = ERC20[prediction.erc20]

    prediction.phantom = false

  }

  return prediction

}

