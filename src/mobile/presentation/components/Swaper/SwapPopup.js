import React, { useCallback, useEffect } from 'react'
import PropTypes from 'prop-types'
import cn from 'clsx'
import { isEmpty } from 'lodash'
import AnimatedButton from '@oracly/pm-react-components/app/mobile/components/common/AnimatedButton'
import { lt, gt, sub, div, mul } from '@oracly/pm-libs/calc-utils'
import { hexHash } from '@oracly/pm-libs/hash-utils'
import { htmlCurrency } from '@oracly/pm-libs/html-utils'

import config from '@config'
import { useTranslation } from '@hooks'
import { ERC20, NATIVE } from '@constants'

import Button from '@components/common/Button'

import { connect } from '@state'

import { isInProgress } from '@state/async'

import { END_SWAP, UPDATE_SWAP } from '@state/actions'
import { SWAP_NATIVE_ERC20 } from '@state/actions'

import { getActiveERC20 } from '@state/getters'
import { getActiveAccountGas } from '@state/getters'
import { getActiveAccountAddress } from '@state/getters'
import { getActiveAccountBalance } from '@state/getters'
import { getActiveSwapPool, getActiveSwapQuote } from '@state/getters'
import { getActiveSwap } from '@state/getters'

import { getPendingTransactionsByEntityId } from '@state/getters'
import { getComittedTransactionsByEntityId } from '@state/getters'
import { getAsyncStatus } from '@state/getters'

import { factoryByCurrency } from '@components/SVG/currency'

import CloseIcon from '@components/SVG/CloseIcon'
import SwapArrow from '@components/SVG/SwapArrow'
import UniswapIcon from '@components/SVG/UniswapIcon'
import ErrorIcon from '@components/SVG/Error'
import MoonPayLogo from '@components/SVG/MoonPayLogo'

import SwapInput from './SwapInput'
import css from './SwapPopup.module.scss'

const SwapPopup = (props) => {
  const { t } = useTranslation()

  const activePool = props.activeSwapPool
  const activeQuote = props.activeSwapQuote
  const activeSwap = props.activeSwap
  const account = props.account

  const erc20 = props.erc20

  const exit = useCallback(() => {
    props.END_SWAP({ erc20 })
  }, [erc20])

  useEffect(() => {
    if (props.isCompletedSwap) {
      props.END_SWAP({ erc20 })
    }
  }, [erc20, props.isCompletedSwap])

  const swap = useCallback(() => {
    if (!account) return
    if (!activePool) return
    if (!activeQuote) return

    props.SWAP_NATIVE_ERC20({
      account,
      erc20,
      swapid: activeSwap.swapid,
      quote: activeQuote,
      pooldata: activePool,
    })
  }, [account, activeQuote, activePool])

  const changeAmountIn = useCallback(
    (amountIn) => {
      props.UPDATE_SWAP({ erc20, update: { amountIn, amountOut: null } })
    },
    [erc20]
  )

  const changeAmountOut = useCallback(
    (amountOut) => {
      props.UPDATE_SWAP({ erc20, update: { amountIn: null, amountOut } })
    },
    [erc20]
  )

  const insufficientSwap = lt(activeQuote?.amountOut, activeSwap.minAmountOut)
  const insufficientLowGas = gt(
    activeQuote?.amountIn,
    sub(props.gas, config.low_gas)
  )

  const exRates = div(activeQuote?.amountIn, activeQuote?.amountOut)
  const insufficientNative = gt(
    mul(activeSwap.minAmountOut, exRates),
    sub(props.gas, config.low_gas)
  )
  const addNative = sub(
    mul(activeSwap.minAmountOut, exRates),
    sub(props.gas, config.low_gas)
  )

  const Erc20Coin = factoryByCurrency(ERC20[erc20])
  const NativeCoin = factoryByCurrency(NATIVE.SYMBOL)

  if (!account) return null
  return (
    <div className={css.container}>
      <div className={css.header}>
        <div>
          <span className={css.title}>
            {t('Get {{currency}}', { currency: ERC20[erc20] })}
          </span>
          <div className={css.subtitle}>
            <span>{t('Min. Required:')}</span>
            <b className={css.titleamount}>
              {htmlCurrency(activeSwap.minAmountOut)} {ERC20[erc20]}
            </b>
          </div>
        </div>

        <Button onClick={exit} className={css.close}>
          <CloseIcon />
        </Button>
      </div>
      <div className={css.swaper}>
        {!insufficientLowGas && insufficientSwap && (
          <div className={css.error}>
            <ErrorIcon />
            <div className={css.message}>
              {t(
                'A minimum swap of {{amount}} {{currency}} is required to support desired play.',
                {
                  amount: htmlCurrency(activeSwap.minAmountOut),
                  currency: ERC20[erc20],
                }
              )}
            </div>
          </div>
        )}
        {insufficientLowGas && !insufficientSwap && (
          <div className={cn(css.error, css.column)}>
            <div className={css.row}>
              <ErrorIcon />
              <div className={css.message}>
                {t(
                  'At least {{amount}} {{currency}} must remain on the balance to play.',
                  {
                    amount: htmlCurrency(config.low_gas),
                    currency: NATIVE.SYMBOL,
                  }
                )}
              </div>
            </div>
            <Button
              className={css.action}
              href={config.buy_native_token}
              title={t('Buy {{currency}}', { currency: NATIVE.SYMBOL })}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MoonPayLogo />
              {t('Buy {{currency}}', { currency: NATIVE.SYMBOL })}
            </Button>
          </div>
        )}
        {insufficientNative &&
          ((insufficientLowGas && insufficientSwap) ||
            (!insufficientLowGas && !insufficientSwap)) && (
            <div className={cn(css.error, css.column)}>
              <div className={css.row}>
                <ErrorIcon />
                <div className={css.message}>
                  {t(
                    'At least {{amount}} {{currency}} must be added to the balance to support desired play.',
                    {
                      amount: htmlCurrency(addNative),
                      currency: NATIVE.SYMBOL,
                    }
                  )}
                </div>
              </div>
              <Button
                className={css.action}
                href={config.buy_native_token}
                title={t('Buy {{currency}}', { currency: NATIVE.SYMBOL })}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MoonPayLogo />
                {t('Buy {{currency}}', { currency: NATIVE.SYMBOL })}
              </Button>
            </div>
          )}
        <div
          className={cn(css.amountIn, {
            [css.errored]: insufficientLowGas,
            propagating: props.isPendingTxn,
          })}
        >
          <div className={css.amountSell}>
            <div className={css.amountTitle}>{t('Sell')}</div>
            <div
              className={cn(css.amount, {
                [css.disabled]: !activeQuote?.amountIn,
              })}
            >
              {(activeQuote?.amountIn || activeSwap.amountIn) && (
                <SwapInput
                  erc20={erc20}
                  initValue={activeQuote?.amountIn || activeSwap.amountIn}
                  disabled={!activeQuote?.amountIn}
                  onChange={changeAmountIn}
                />
              )}
              {!(activeQuote?.amountIn || activeSwap.amountIn) &&
                htmlCurrency(0)}
            </div>
          </div>

          <div className={css.currencyBalance}>
            <div className={css.currency}>
              <NativeCoin />
              <div>{NATIVE.SYMBOL}</div>
            </div>
            <div className={css.balance}>
              {insufficientLowGas && (
                <div
                  className={css.info}
                  title={t(
                    'At least {{amount}} {{currency}} must remain on the balance to play.',
                    {
                      amount: htmlCurrency(config.low_gas),
                      currency: NATIVE.SYMBOL,
                    }
                  )}
                >
                  <ErrorIcon />
                </div>
              )}
              {t('Balance: {{balance}}', { balance: htmlCurrency(props.gas) })}
            </div>
          </div>
        </div>
        <div className={css.arrow}>
          <SwapArrow />
        </div>
        <div
          className={cn(css.amountOut, {
            [css.errored]: insufficientSwap,
            propagating: props.isPendingTxn,
          })}
        >
          <div className={css.amountBuy}>
            <div className={css.amountTitle}>{t('Buy')}</div>
            <div className={css.amount}>
              {(activeQuote?.amountOut || activeSwap.amountOut) && (
                <SwapInput
                  erc20={erc20}
                  initValue={activeQuote?.amountOut || activeSwap.amountOut}
                  disabled={!activeQuote?.amountOut}
                  onChange={changeAmountOut}
                />
              )}
              {!(activeQuote?.amountOut || activeSwap.amountOut) &&
                htmlCurrency(0)}
            </div>
          </div>

          <div className={css.currencyBalance}>
            <div className={css.currency}>
              <Erc20Coin />
              <div>{ERC20[erc20]}</div>
            </div>
            <div className={css.balance}>
              {insufficientSwap && (
                <div
                  className={css.info}
                  title={t(
                    'A minimum balance of {{amount}} {{currency}} is required to make the desired prediction.',
                    {
                      amount: htmlCurrency(activeSwap.minAmountOut),
                      currency: ERC20[erc20],
                    }
                  )}
                >
                  <ErrorIcon />
                </div>
              )}
              {t('Balance: {{balance}}', {
                balance: htmlCurrency(props.balance),
              })}
            </div>
          </div>
        </div>
      </div>
      <div className={css.btnswap}>
        <AnimatedButton
          onClick={swap}
          className={cn(css.btn, {
            [css.disabled]: insufficientLowGas,
            propagating: props.isPendingAct || props.isPendingTxn,
          })}
        >
          {t('SWAP')}
        </AnimatedButton>
      </div>
      <ul className={css.list}>
        <li className={css.item}>
          <div className={css.exrate}>
            {t('1 {{OUT}} = {{rate}} {{IN}}', {
              OUT: ERC20[erc20],
              IN: NATIVE.SYMBOL,
              rate: htmlCurrency(exRates),
            })}
          </div>
        </li>
        <li className={css.item}>
          <div className={css.left}>
            <span className={css.label}>{t('Max. slippage')}</span>
          </div>
          <div className={css.right}>{t('0.5%')}</div>
        </li>
        <li className={css.item}>
          <div className={css.left}>
            <span className={css.label}>{t('Protocol')}</span>
          </div>
          <div className={css.right}>
            {t('Uniswap V3')}
            <UniswapIcon />
          </div>
        </li>
      </ul>
    </div>
  )
}

SwapPopup.propTypes = {
  close: PropTypes.func,
  title: PropTypes.string,
}

export default connect(
  (state) => {
    const erc20 = getActiveERC20(state)
    const activeSwap = getActiveSwap(state)
    return {
      erc20,
      gas: getActiveAccountGas(state),
      balance: getActiveAccountBalance(state, ERC20[erc20]),
      account: getActiveAccountAddress(state),
      activeSwap,
      activeSwapPool: getActiveSwapPool(state),
      activeSwapQuote: getActiveSwapQuote(state),

      isPendingTxn: !isEmpty(
        getPendingTransactionsByEntityId(
          state,
          hexHash({ SWAP_NATIVE_ERC20, swapid: activeSwap.swapid })
        )
      ),
      isPendingAct: isInProgress(
        getAsyncStatus(state, SWAP_NATIVE_ERC20, [activeSwap.swapid])
      ),

      isCompletedSwap: !isEmpty(
        getComittedTransactionsByEntityId(
          state,
          hexHash({ SWAP_NATIVE_ERC20, swapid: activeSwap.swapid })
        )
      ),
    }
  },
  ({ command, query }) => [
    command(END_SWAP),
    command(UPDATE_SWAP),

    query(SWAP_NATIVE_ERC20),
  ]
)(React.memo(SwapPopup))
