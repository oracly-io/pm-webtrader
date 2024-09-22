import { isFunction, isEmpty, map, castArray } from 'lodash'
import { nowUnixTS } from '@oracly/pm-libs/date-utils'
import { get, set } from '@oracly/pm-libs/immutable'
import { success } from '@oracly/pm-libs/redux-cqrs'

import logger from '@lib/logger'

import { PREDICTION_BC } from '@state/mappers'

import {

  READ_BLOCKCHAIN_ROUND_BY_ID,
  READ_BLOCKCHAIN_PREDICTION_BY_ID,

  READ_BLOCKCHAIN_LATEST_PREDICTIONS_BY_ROUNDID,
  READ_BLOCKCHAIN_LATEST_PREDICTIONS_BY_ADDRESS,
  READ_BLOCKCHAIN_BLOCK_NUMBER,
} from '@state/actions'

function reducerBlockFromTransaction(action, entityIds) {

  const handler = (action) => (state, args) => {
    const txn = args.txn

    if (isEmpty(txn)) {
      logger.warn('[Ignered] Action "%s" do not have "txn" in its args!', action)
      return state
    }

    const number = Number(txn.blockNumber)
    if (!number) return state

    if (isFunction(entityIds)) {
      const ids = castArray(entityIds(args))
      for (const entityid of ids) {
        if (entityid) {
          const entityblock = Number(get(state, ['entity', entityid, 'number']))
          if (!entityblock || entityblock < number) {
            state = set(state, ['entity', entityid], { number })
          }
        }
      }
    }

    return state
  }

  return { [action]: handler(action) }
}

export default {

  ...reducerBlockFromTransaction(success(READ_BLOCKCHAIN_ROUND_BY_ID), ({ roundid }) => roundid),
  ...reducerBlockFromTransaction(success(READ_BLOCKCHAIN_PREDICTION_BY_ID), ({ predictionid }) => predictionid),
  ...reducerBlockFromTransaction(success(READ_BLOCKCHAIN_LATEST_PREDICTIONS_BY_ROUNDID), ({ result: [bcpredictions, size] }) => map(bcpredictions, PREDICTION_BC.predictionid)),
  ...reducerBlockFromTransaction(success(READ_BLOCKCHAIN_LATEST_PREDICTIONS_BY_ADDRESS), ({ result: [bcpredictions, size] }) => map(bcpredictions, PREDICTION_BC.predictionid)),

  [success(READ_BLOCKCHAIN_BLOCK_NUMBER)]: (state, { result: blockNumber }) => {

    const number = Number(blockNumber)
    if (!number) return state

    const latest = Number(get(state, ['latest_bc', 'number']))
    if (!latest || number > latest) {
      state = set(state, ['latest_bc', 'number'], number)
      state = set(state, ['latest_bc', 'timestamp'], nowUnixTS())
    }

    return state
  },
}

