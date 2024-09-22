import { CurrencyAmount, Percent, Token,
  ChainId,
  TradeType,
} from '@uniswap/sdk-core'
import { SwapRouter, UniswapTrade } from '@uniswap/universal-router-sdk'
import { Trade as RouterTrade } from '@uniswap/router-sdk'
import { nearestUsableTick, TickMath, TICK_SPACINGS, FeeAmount } from '@uniswap/v3-sdk'
import {
  Pool as V3Pool,
  Route as V3Route,
  Trade as V3Trade,
  SwapQuoter,
} from '@uniswap/v3-sdk'
import { mul, fromDecimalERC20 } from '@oracly/pm-libs/calc-utils'
import { web3client } from '@oracly/pm-libs/crypto-wallet'

import config from '@config'

import IUniswapV3PoolABI from '@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json'
import { computePoolAddress } from '@uniswap/v3-sdk'
import { AbiCoder } from 'ethers'

import { ERC20, NATIVE } from '@constants'

import { Matic } from './matic'

const FEE_AMOUNT = FeeAmount.MEDIUM

const createSwapTokens = (erc20) => {
  const native = Matic.onChain(ChainId.POLYGON)
  const wrapped = native.wrapped
  const target = new Token(
    NATIVE.CHAIN,
    erc20,
    ERC20.DECIMALS[ERC20[erc20]],
    ERC20.SYMBOL[ERC20[erc20]],
    ERC20.DESCRIPTION[ERC20[erc20]],
  )
  return {
    native,
    target,
    wrapped,
  }
}

export const swapClient = {
  get: (erc20) => {

    const { wrapped, target } = createSwapTokens(erc20)
		const poolAddress = computePoolAddress({
			factoryAddress: config.SWAP_POOL_FACTORY_CONTRACT_ADDRESS,
			tokenA: wrapped,
			tokenB: target,
			fee: FEE_AMOUNT,
		})
		return web3client.get(poolAddress, IUniswapV3PoolABI.abi)
  },
  readPool: async (erc20) => {

		const poolContract = swapClient.get(erc20)
		const [liquidity, slot0] = await Promise.all([
			poolContract.liquidity(),
			poolContract.slot0(),
		])
    return {
      liquidity: String(liquidity),
      sqrtPriceX96: String(slot0[0]),
      tick: Number(slot0[1]),
    }
  },
  readQuoteExIn: async (amount, erc20, pooldata) => {

    const { wrapped, target } = createSwapTokens(erc20)
    const feeAmount = FEE_AMOUNT
    const v3pool = new V3Pool(
      wrapped,
      target,
      feeAmount,
      pooldata.sqrtPriceX96,
      pooldata.liquidity,
      pooldata.tick,
    )

    const rawAmount = fromDecimalERC20(amount, wrapped.address)
    const params = await SwapQuoter.quoteCallParameters(
      new V3Route([v3pool], wrapped, target),
      CurrencyAmount.fromRawAmount(wrapped, rawAmount),
      TradeType.EXACT_INPUT,
      { useQuoterV2: true }
    )

    const quoteCallReturnData = await web3client.call({
      to: config.QUOTER_CONTRACT_ADDRESS,
      data: params.calldata,
    })

    return AbiCoder.defaultAbiCoder().decode(['uint256'], quoteCallReturnData)
  },
  readQuoteExOut: async (amount, erc20, pooldata) => {

    const { wrapped, target } = createSwapTokens(erc20)
    const feeAmount = FEE_AMOUNT
    const v3pool = new V3Pool(
      wrapped,
      target,
      feeAmount,
      pooldata.sqrtPriceX96,
      pooldata.liquidity,
      pooldata.tick,
    )

    const rawAmount = fromDecimalERC20(amount, target.address)
    const params = await SwapQuoter.quoteCallParameters(
      new V3Route([v3pool], wrapped, target),
      CurrencyAmount.fromRawAmount(target, rawAmount),
      TradeType.EXACT_OUTPUT,
      { useQuoterV2: true }
    )

    const quoteCallReturnData = await web3client.call({
      to: config.QUOTER_CONTRACT_ADDRESS,
      data: params.calldata,
    })

    return AbiCoder.defaultAbiCoder().decode(['uint256'], quoteCallReturnData)
  },
  swap: async (account, erc20, quote, pooldata, props) => {
    const { wrapped, native, target } = createSwapTokens(erc20)
    const feeAmount = FEE_AMOUNT
    const v3Pool = new V3Pool(
      wrapped,
      target,
      feeAmount,
      pooldata.sqrtPriceX96,
      pooldata.liquidity,
      pooldata.tick,
      [
        {
          index: nearestUsableTick(TickMath.MIN_TICK, TICK_SPACINGS[feeAmount]),
          liquidityNet: pooldata.liquidity,
          liquidityGross: pooldata.liquidity,
        },
        {
          index: nearestUsableTick(TickMath.MAX_TICK, TICK_SPACINGS[feeAmount]),
          liquidityNet: mul(pooldata.liquidity, -1),
          liquidityGross: pooldata.liquidity,
        },
      ]
    )

    const v3trade = await V3Trade.fromRoute(
      new V3Route([v3Pool], native, target),
      CurrencyAmount.fromRawAmount(native, quote.rawAmountIn),
      TradeType.EXACT_INPUT
    )
    const routerTrade = new RouterTrade({
      v3Routes: [{
        routev3: v3trade.route,
        inputAmount: v3trade.inputAmount,
        outputAmount: v3trade.outputAmount,
      }],
      v2Routes: [],
      mixedRoutes: [],
      tradeType: v3trade.tradeType,
    })

    const opts = {
      slippageTolerance: new Percent(50, 10_000), // 50 bips, or 0.5%
      deadline: Math.floor(Date.now() / 1000) + 60 * 20, // 20 minutes from the current Unix time
      recipient: account,
    }
    const params = SwapRouter.swapCallParameters(new UniswapTrade(routerTrade, opts))
    const tx = {
      to: config.SWAP_ROUTER_ADDRESS,
      from: account,
      data: params.calldata,
      value: params.value,
      ...props
    }

    return web3client.sendTransaction(tx)
  }
}

