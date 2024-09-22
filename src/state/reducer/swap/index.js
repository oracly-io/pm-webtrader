import { isEmpty } from 'lodash'
import { toDecimalERC20, fromDecimalERC20 } from '@oracly/pm-libs/calc-utils'
import { success } from '@oracly/pm-libs/redux-cqrs'
import { set, get, del } from '@oracly/pm-libs/immutable'

import { START_SWAP, END_SWAP } from '@actions'
import { READ_BLOCKCHAIN_SWAP_NATIVE_ERC20_POOL } from '@actions'
import { READ_BLOCKCHAIN_SWAP_NATIVE_ERC20_QUOTE_EX_IN } from '@actions'
import { READ_BLOCKCHAIN_SWAP_NATIVE_ERC20_QUOTE_EX_OUT } from '@actions'
import { UPDATE_SWAP } from '@actions'

import { NATIVE } from '@constants'

export default {

  [START_SWAP]: (state, { currency, erc20, minAmountOut, maxAmountIn, amountIn, amountOut }) => {
    return set(state, [erc20], {
      currency,
      erc20,
      amountIn,
      amountOut,
      maxAmountIn,
      minAmountOut,
      timestamp: Date.now(),
      swapid: Date.now(),
    })
  },

  [UPDATE_SWAP]: (state, { erc20, update }) => {
    if (isEmpty(update)) return state

    state = del(state, [erc20, 'pool'])
    state = del(state, [erc20, 'quote'])
    state = set(state, [erc20], s => {
      s = { ...s }
      for (const p in update) s[p] = update[p]
      return s
    })

    return state
  },

  [END_SWAP]: (state, { erc20 }) => {
    return del(state, [erc20])
  },

  [success(READ_BLOCKCHAIN_SWAP_NATIVE_ERC20_POOL)]: (state, { erc20, result }) => {
    // ignore if no active swap session present
    const active = get(state, [erc20])
    if (!active) return state

    const { liquidity, sqrtPriceX96, tick } = result
    return set(state, [erc20, 'pool'], { liquidity, sqrtPriceX96, tick, timestamp: Date.now() })
  },

  [success(READ_BLOCKCHAIN_SWAP_NATIVE_ERC20_QUOTE_EX_IN)]: (state, { erc20, amount, pool, result }) => {
    // ignore if no active swap session present
    const active = get(state, [erc20])
    if (!active) return state

    result = get(result, [0])
    return set(state, [erc20, 'quote'], {
      amountIn: amount,
      amountOut: toDecimalERC20(result, erc20),

      rawAmountIn: fromDecimalERC20(amount, NATIVE.WRAPPED.ADDRESS),
      rawAmountOut: result,

      timestamp: Date.now(),
    })
  },

  [success(READ_BLOCKCHAIN_SWAP_NATIVE_ERC20_QUOTE_EX_OUT)]: (state, { erc20, amount, pool, result }) => {
    // ignore if no active swap session present
    const active = get(state, [erc20])
    if (!active) return state

    result = get(result, [0])
    return set(state, [erc20, 'quote'], {
      amountIn: toDecimalERC20(result, NATIVE.WRAPPED.ADDRESS),
      amountOut: amount,

      rawAmountIn: result,
      rawAmountOut: fromDecimalERC20(amount, erc20),

      timestamp: Date.now(),
    })
  },

}

