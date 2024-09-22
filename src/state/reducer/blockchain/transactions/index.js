import { pick, has, castArray, isString, isEmpty, isFunction, toLower } from 'lodash'
import { hexHash } from '@oracly/pm-libs/hash-utils'
import { get, set } from '@oracly/pm-libs/immutable'
import { success, fails } from '@oracly/pm-libs/redux-cqrs'

import logger from '@lib/logger'

import { toPredictionId } from '@state/mappers'

import {
  RESOLVE,
  WITHDRAW,
  MINT_DEMO_1000,
  PLACE_PREDICTION,
  RESOLVE_NOCONTEST,
  RESOLVE_WITHDRAW,
  AWAIT_TRANSACTION,
  SWAP_NATIVE_ERC20,
  APPROVE_ACCOUNT_ALLOWANCE,
  RESOLVE_WITHDRAW_NOCONTEST,
} from '@state/actions'

function reducer(action, entityIds) {
  if (!(action && isString(action))) {
    throw new Error('action type have to be string!')
  }

  const handler = (action) => (state, args) => {
    const hash = toLower(get(args, ['result', 'hash']) || get(args, ['result', 'transactionHash']))
    if (isEmpty(hash)) {
      logger.warn('[Ignered] Action "%s" do not have "result.hash" in its args!', action)
      return state
    }

    const txn = pick(get(args, ['result']), ['blockNumber', 'blockHash', 'status'])
    if (!has(txn, 'blockNumber') || !has(txn, 'blockHash')) {
      logger.warn('[Ignered] Action "%s" do not have "result.blockNumber" or "result.blockHash" in its args!', action)
      return state
    }

    txn.hash = hash
    state = set(state, ['collection', hash], txn)
    if (isFunction(entityIds)) {
      const ids = castArray(entityIds(args))
      for (const entityid of ids) {
        if (entityid) {
          state = set(state, ['entity', entityid, hash], hash)
        }
      }
    }

    return state
  }

  return { [action]: handler(action) }
}

export default {
  ...reducer(success(PLACE_PREDICTION), (args) => [args.roundid, toPredictionId(args)]),
  ...reducer(success(RESOLVE), ({ roundid }) => roundid),
  ...reducer(success(RESOLVE_NOCONTEST), ({ roundid }) => roundid),
  ...reducer(success(AWAIT_TRANSACTION)),
  ...reducer(fails(AWAIT_TRANSACTION)),
  ...reducer(success(WITHDRAW), ({ predictionid }) => predictionid),
  ...reducer(success(RESOLVE_WITHDRAW), ({ roundid, predictionid }) => [roundid, predictionid]),
  ...reducer(success(RESOLVE_WITHDRAW_NOCONTEST), ({ roundid, predictionid }) => [roundid, predictionid]),

  ...reducer(success(APPROVE_ACCOUNT_ALLOWANCE), ({ account, erc20 }) => hexHash({ APPROVE_ACCOUNT_ALLOWANCE, erc20 })),
  ...reducer(success(MINT_DEMO_1000), () => hexHash({ MINT_DEMO_1000 })),
  ...reducer(success(SWAP_NATIVE_ERC20), ({ swapid }) => hexHash({ SWAP_NATIVE_ERC20, swapid })),
}

