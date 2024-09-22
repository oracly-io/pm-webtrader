import React, { useEffect } from 'react'
import { lt, gt } from '@oracly/pm-libs/calc-utils'
import config from '@config'

import { connect } from '@state'

import { useModal } from '@hooks'
import { useScheduledQuery } from '@hooks'

import { END_SWAP } from '@state/actions'
import { SWAP_NATIVE_ERC20 } from '@state/actions'

import { READ_BLOCKCHAIN_SWAP_NATIVE_ERC20_QUOTE_EX_OUT } from '@state/actions'
import { READ_BLOCKCHAIN_SWAP_NATIVE_ERC20_QUOTE_EX_IN } from '@state/actions'
import { READ_BLOCKCHAIN_SWAP_NATIVE_ERC20_POOL } from '@state/actions'

import { getActiveAccountGas, getActiveERC20 } from '@state/getters'
import { getActiveAccountAddress } from '@state/getters'
import { getActiveSwap, getActiveSwapPool, getActiveSwapQuote } from '@state/getters'

import SwapPopup from './SwapPopup'

const Swaper = (props) => {
  const isConnected = !!props.account

  const activeSwap = props.activeSwap
  const amountOut = activeSwap?.amountOut
  const amountIn = activeSwap?.amountIn
  const activePool = props.activeSwapPool
  const activeQuote = props.activeSwapQuote
  const erc20 = props.erc20

  const insufficientGas = lt(props.gas, config.low_gas)

  const { modal, open } = useModal({
    Content: SwapPopup,
    hideClose: true,
  })

  useEffect(() => {
    if (insufficientGas) return
    if (!erc20) return
    if (!isConnected) return
    if (!activeSwap) return
    if (!gt(amountOut, 0)) return

    if (open) open()

  }, [activeSwap, insufficientGas, erc20, isConnected, amountOut, open])

  useEffect(() => {
    if (!activeSwap || !isConnected) return

    if (!activePool) {
       props.READ_BLOCKCHAIN_SWAP_NATIVE_ERC20_POOL({ erc20 })
    }

    if (activePool && !activeQuote) {
      if (gt(amountOut, 0)) {
        props.READ_BLOCKCHAIN_SWAP_NATIVE_ERC20_QUOTE_EX_OUT({ pool: activePool, amount: amountOut, erc20 })
      }
      if (gt(amountIn, 0)) {
        props.READ_BLOCKCHAIN_SWAP_NATIVE_ERC20_QUOTE_EX_IN({ pool: activePool, amount: amountIn, erc20 })
      }
    }

  }, [isConnected, activeSwap, activePool, activeQuote, amountOut])

  useScheduledQuery((query, state) => {
    const account = getActiveAccountAddress(state)
    const activeSwap = getActiveSwap(state)
    const activeSwapPool = getActiveSwapPool(state)
    const activeSwapQuote = getActiveSwapQuote(state)
    const erc20 = getActiveERC20(state)

    if (
      account &&
      activeSwapPool &&
      activeSwapQuote &&
      gt(activeSwap?.amountIn, 0) &&
      erc20
    ) {
      query(
        READ_BLOCKCHAIN_SWAP_NATIVE_ERC20_QUOTE_EX_IN,
        {
          pool: activeSwapPool,
          amount: activeSwap.amountIn,
          erc20
        },
        { schedule: 15 }
      )
    }
  }, [])

  if (insufficientGas) return null
  if (!erc20) return null
  if (!isConnected) return null
  if (!activeSwap) return null

  return modal
}

export default connect(
  (state) => {
    return {
      gas: getActiveAccountGas(state),

      erc20: getActiveERC20(state),

      account: getActiveAccountAddress(state),
      activeSwap: getActiveSwap(state),
      activeSwapPool: getActiveSwapPool(state),
      activeSwapQuote: getActiveSwapQuote(state),
    }
  },
  ({ command, query }) => ([
    command(END_SWAP),

    query(READ_BLOCKCHAIN_SWAP_NATIVE_ERC20_QUOTE_EX_OUT),
    query(READ_BLOCKCHAIN_SWAP_NATIVE_ERC20_QUOTE_EX_IN),
    query(READ_BLOCKCHAIN_SWAP_NATIVE_ERC20_POOL),
    query(SWAP_NATIVE_ERC20),

  ])
)(React.memo(Swaper))
