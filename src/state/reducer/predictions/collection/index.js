import { clone, toLower, isObject, isEmpty, compact, map } from 'lodash'
import { success } from '@oracly/pm-libs/redux-cqrs'
import { set, get } from '@oracly/pm-libs/immutable'

import { PLACE_PREDICTION } from '@actions'
import { READ_BLOCKCHAIN_LATEST_PREDICTIONS_BY_ROUNDID } from '@actions'
import { READ_BLOCKCHAIN_LATEST_PREDICTIONS_BY_ADDRESS } from '@actions'
import { READ_BLOCKCHAIN_PREDICTION_BY_ID } from '@actions'
import { READ_BLOCKCHAIN_ROUND_BY_ID } from '@actions'
import { SET_PREDICTION_PROPS_BY_ID } from '@actions'

import { toPredictionId, createPrediction, PREDICTION_BC, ROUND_BC } from '@state/mappers'
import { blockchain2Prediction } from '@state/mappers'

const TOTAL_IDX = 0

function updateMissing(state, roundids) {

  state = set(state, ['__missing__', 'roundids'], missing => {
    missing = clone(missing)

    for (const roundid of roundids) {
      const round = get(state, ['_rounds', roundid])
      if (isEmpty(round)) missing[roundid] = roundid
      else               delete missing[roundid]
    }

    return missing
  })

  return state
}

const reduceBcPredictions = (state, bcpredictions, txn) => {

  bcpredictions = compact(bcpredictions)
  if (isEmpty(bcpredictions)) return state

  state = updateMissing(state, map(bcpredictions, bcprediction => get(bcprediction, PREDICTION_BC.roundid)))

  state = set(state, ['hash'], hash => {
    for (const bcprediction of bcpredictions) {
      const predictionid = toLower(get(bcprediction, PREDICTION_BC.predictionid))
      const prediction = hash[predictionid]
      hash[predictionid] = blockchain2Prediction(prediction, bcprediction, txn?.blockNumber)
    }
    return hash
  })

  state = set(state, ['_idx_bettor'], _idx_bettor => {
    for (const bcprediction of bcpredictions) {
      const predictionid = toLower(get(bcprediction, PREDICTION_BC.predictionid))
      const bettor = toLower(get(bcprediction, PREDICTION_BC.bettor))
      if (isEmpty(_idx_bettor[bettor])) _idx_bettor[bettor] = {}
      _idx_bettor[bettor][predictionid] = predictionid
    }
    return _idx_bettor
  })

  return state

}

export default {

  metadata: {
    persist: 'short'
  },

  [success(PLACE_PREDICTION)]: (state, { account, erc20, wager, gameid, roundid, position }) => {

    const predictionid = toPredictionId({ roundid, account, position })
    const prediction = get(state, ['hash', predictionid])
    if (isEmpty(prediction)) {
      state = set(state, ['hash', predictionid], createPrediction({ account, erc20, wager, gameid, roundid, position }))
      state = set(state, ['_idx_bettor', account, predictionid], predictionid)
    }

    return state
  },

  [success(READ_BLOCKCHAIN_LATEST_PREDICTIONS_BY_ROUNDID)]: (state, { roundid, position = TOTAL_IDX, txn, result }) => {

    const [bcpredictions, size] = result
    if (String(size) === '0') return state
    state = reduceBcPredictions(state, bcpredictions, txn)
    state = set(state, ['prediction_by_round_size', roundid, position], String(size))

    return state
  },

  [success(READ_BLOCKCHAIN_LATEST_PREDICTIONS_BY_ADDRESS)]: (state, { address, txn, result }) => {

    const [bcpredictions, size] = result
    if (String(size) === '0') return state
    state = reduceBcPredictions(state, bcpredictions, txn)
    state = set(state, ['prediction_by_address_size', address], String(size))

    return state
  },

  [success(READ_BLOCKCHAIN_PREDICTION_BY_ID)]: (state, { txn, result }) => reduceBcPredictions(state, [result], txn),

  // TODO: remove this if subgraph will be removed
  // related to times when data read form GN
  [success(READ_BLOCKCHAIN_ROUND_BY_ID)]: (state, { roundid, txn, result }) => {
    const [bcround] = result

    const bcroundid = toLower(get(bcround, ROUND_BC.roundid))
    if (isEmpty(bcround) || bcroundid !== roundid) return state

    state = set(state, ['_rounds', roundid], roundid)
    state = updateMissing(state, [roundid])

    return state

  },

  [SET_PREDICTION_PROPS_BY_ID]: (state, { predictionid, props }) => {
    if (!isObject(props) || isEmpty(props)) return state

    const prediction = get(state, ['hash', predictionid])
    if (isEmpty(prediction)) return state

    state = set(state, ['hash', predictionid], { ...prediction, ...props })

    return state
  },

}
