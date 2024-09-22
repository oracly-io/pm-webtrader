import { toLower, isEmpty, clone, get } from 'lodash'
import { success } from '@oracly/pm-libs/redux-cqrs'
import { set } from '@oracly/pm-libs/immutable'

import { READ_BLOCKCHAIN_LATEST_PREDICTIONS_BY_ROUNDID } from '@actions'

import { PREDICTION_BC } from '@state/mappers'

const TOTAL_IDX = 0

export default {

  metadata: {
    persist: 'short'
  },

  [success(READ_BLOCKCHAIN_LATEST_PREDICTIONS_BY_ROUNDID)]: (state, { roundid, position = TOTAL_IDX, txn, result }) => {
    const [bcpredictions, size] = result

    if (isEmpty(bcpredictions)) return state
    if (String(size) === '0') return state

    state = set(state, ['rounds', roundid], pp => {
      for (const bcprediction of bcpredictions) {
        const predictionid = toLower(get(bcprediction, PREDICTION_BC.predictionid))

        pp[position] = clone(pp[position] || {})

        pp[position][predictionid] = predictionid
      }

      return pp

    })

    return state
  },

}
