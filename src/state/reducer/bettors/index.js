import { toLower } from 'lodash'
import { toDecimalERC20, toDecimalGas } from '@oracly/pm-libs/calc-utils'
import { get, set } from '@oracly/pm-libs/immutable'
import { success } from '@oracly/pm-libs/redux-cqrs'

import config from '@config'

import { ERC20 } from '@constants'

import { SET_ACCOUNT } from '@actions'
import { GET_ALLOWANCE, GET_BALANCE } from '@actions'
import { GET_GAS_BALANCE } from '@actions'

export default {

  [SET_ACCOUNT]: (state, { account }) => {
    state = set(state, ['active'], toLower(account))
    return state
  },

  [success(GET_ALLOWANCE)]: (state, { account, target, erc20, result, txn: { blockNumber } }) => {

    target = target || config.oraclyv1_address

    blockNumber = Number(blockNumber)
    if (!blockNumber) return state

    const prevBlockNumber = Number(get(state, [
      'accounts',
      toLower(account),
      'allowance',
      ERC20[erc20],
      target,
      'blockNumber',
    ]))

    if (!prevBlockNumber || blockNumber > prevBlockNumber) {
      state = set(
        state,
        ['accounts', toLower(account), 'allowance', ERC20[erc20], target],
        { amount: toDecimalERC20(result.toString(), erc20), blockNumber }
      )
    }

    return state

  },

  [success(GET_BALANCE)]: (state, { account, erc20, result, txn: { blockNumber } }) => {

    blockNumber = Number(blockNumber)
    if (!blockNumber) return state

    const prevBlockNumber = Number(get(state, [
      'accounts',
      toLower(account),
      'balance',
      ERC20[erc20],
      'blockNumber',
    ]))

    if (!prevBlockNumber || blockNumber > prevBlockNumber) {
      state = set(
        state,
        ['accounts', toLower(account), 'balance', ERC20[erc20]],
        { amount: toDecimalERC20(result.toString(), erc20), blockNumber },
      )
    }

    return state

  },


  [success(GET_GAS_BALANCE)]: (state, { account, result, txn: { blockNumber } }) => {

    blockNumber = Number(blockNumber)
    if (!blockNumber) return state

    const prevBlockNumber = Number(get(state, [
      'accounts',
      toLower(account),
      'gas',
      'blockNumber',
    ]))

    if (!prevBlockNumber || blockNumber > prevBlockNumber) {
      state = set(
        state,
        ['accounts', toLower(account), 'gas'],
        { amount: toDecimalGas(result.toString()), blockNumber },
      )
    }

    return state

  },

}
