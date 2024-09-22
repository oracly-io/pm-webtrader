import React, { useState, useCallback } from 'react'
import { map, isEmpty, isNaN } from 'lodash'
import cn from 'clsx'
import * as Notifications from '@oracly/pm-react-components/app/desktop/components/Notifications'
import AnimatedButton from '@oracly/pm-react-components/app/desktop/components/common/AnimatedButton'
import { sub, lt, max, gte } from '@oracly/pm-libs/calc-utils'
import { futureProfitPercent, fromDecimalERC20 } from '@oracly/pm-libs/calc-utils'
import { nowUnixTS } from '@oracly/pm-libs/date-utils'
import { hexHash } from '@oracly/pm-libs/hash-utils'
import { htmlPercentSigned, htmlCurrency } from '@oracly/pm-libs/html-utils'

import config from '@config'

import { NATIVE } from '@constants'

import ArrowDownIcon from '@components/SVG/BetArrowDown'
import ArrowUpIcon from '@components/SVG/BetArrowUp'
import ZeroIcon from '@components/SVG/ZeroIcon'
import WalletIcon from '@components/SVG/Wallet'
import GasIcon from '@components/SVG/Gas'

import { useTranslate } from '@lib/i18n-utils'

import { getPendingTransactionsByEntityId } from '@state/getters'
import { isLoading, isSucceed } from '@state/getters'
import { toPredictionId } from '@state/mappers'
import { PLACE_PREDICTION, APPROVE_ACCOUNT_ALLOWANCE } from '@actions'

import { WALLET_CONNECT, SET_SHOW_CONNECT_BAR } from '@actions'
import { START_SWAP } from '@actions'
import { MINT_DEMO_1000 } from '@actions'
import { useRenderAt } from '@hooks'

import { connect } from '@state'
import { getActualRound, getActiveGameId } from '@state/getters'
import { getGameById } from '@state/getters'
import { getActiveAccountGas, getActiveAccountBalance } from '@state/getters'
import { getActiveAccountAllowance, getActiveAccountAddress } from '@state/getters'

import { PRIZEFUNDS, DEMO } from '@constants'
import { UP, DOWN, EQUAL } from '@constants'

import WagerInput from '@components/BetBar/WagerInput'

import BetBarLock from './BetBarLock'

import css from './BetBar.module.scss'

const BetBar = (props) => {
  const t = useTranslate()

  const round = props.round
  const roundid = props.roundid
  const game = props.game
  const gameid = props.gameid
  const erc20 = game?.erc20
  const currency = game?.currency
  const account = props.account
  const confirmingUP = props.confirmingUP
  const confirmingDOWN = props.confirmingDOWN
  const confirmingEQUAL = props.confirmingEQUAL
  const inprogress = props.inprogress
  const insufficientBalance = lt(props.balance, game?.minWager)
  const insufficientGas = lt(props.gas, config.low_gas)
  const nanBalance = isNaN(Number(String(props.balance)))

  const [wager, setWager] = useState(game?.minWager || 0)

  const getERC20 = useCallback(() => {
    if (!currency) return
    if (!erc20) return

    const minAmountOut = sub(game?.minWager, props.balance)
    if (!minAmountOut) return

    const maxAmountIn = sub(props.gas, config.low_gas)
    props.START_SWAP({ currency, erc20, amountOut: minAmountOut, minAmountOut, maxAmountIn })

  }, [props.gas, game?.minWager, props.balance, erc20, currency])

  const locked = round?.lockDate <= nowUnixTS()
  useRenderAt(round?.lockDate)

  const hushed =
    !locked && round?.lockDate - nowUnixTS() <= config.entry_hushed_at
  useRenderAt(round?.lockDate - config.entry_hushed_at)

  const flickering =
    !locked &&
    !hushed &&
    round?.lockDate - nowUnixTS() <= config.entry_flickering_at
  useRenderAt(round?.lockDate - config.entry_flickering_at)

  const profitPercents = futureProfitPercent(round?.prizefunds, wager)

  const approve = useCallback(() => {
    if (account && erc20 && props.balance) {
      props.APPROVE_ACCOUNT_ALLOWANCE({
        account,
        erc20,
        amount: fromDecimalERC20(props.balance, erc20),
      })
    }
  }, [account, erc20, currency, props.balance])

  const demo_1000 = useCallback(() => {
    if (account) props.MINT_DEMO_1000()
  }, [account])

  const connecting = useCallback(() => {
    if (!inprogress) props.SET_SHOW_CONNECT_BAR({ isOpened: true })
  }, [inprogress])

  const restart = useCallback(() => {
    window.location.href = window.location.href
  }, [])

  let [placePredictionUp, placePredictionDown, placePredictionZero] = map(
    [UP, DOWN, EQUAL],
    (position) => () => {
      if (+wager && gameid) {
        props.PLACE_PREDICTION({
          account,
          erc20,
          wager: fromDecimalERC20(wager, erc20),
          gameid,
          roundid,
          position,
        })
      }
    }
  )

  placePredictionUp = useCallback(placePredictionUp, [
    wager,
    gameid,
    account,
    roundid,
  ])
  placePredictionZero = useCallback(placePredictionZero, [
    wager,
    gameid,
    account,
    roundid,
  ])
  placePredictionDown = useCallback(placePredictionDown, [
    wager,
    gameid,
    account,
    roundid,
  ])

  const percentageUP = Number(profitPercents[PRIZEFUNDS.UP])
  const percentageDOWN = Number(profitPercents[PRIZEFUNDS.DOWN])
  const percentageEQUAL = Number(profitPercents[PRIZEFUNDS.EQUAL])

  const currentWager = max(game?.minWager, wager)
  const insufficientAllowance =
    lt(props.allowance, currentWager) && gte(props.balance, currentWager)

  const disabled = locked || !account || insufficientAllowance || insufficientBalance || nanBalance
  const warning = !account || insufficientAllowance || insufficientBalance || nanBalance

  const hideDemo1000 =
    props.successMinting && !props.minting && !props.confirmingMinting

  if (!game || !round) return null
  return (
    <>
      <Notifications.Widget className={css.warnings}>
        {insufficientAllowance && (
          <Notifications.Item
            className={cn({
              propagating: props.approveing || props.confirmingApprove,
            })}
            icon={<WalletIcon />}
            action={t('Approve {{currency}}', { currency })}
            onClick={approve}
            message={t(
              'Spent limit reached! Set a new limit: {{amount}} {{currency}}',
              {
                amount: htmlCurrency(props.balance),
                currency
              })
            }
          />
        )}

        {insufficientGas && (
          <Notifications.Item
            title={t('Gas fees are required to process transactions on the blockchain. A higher gas price and priority fee can lead to faster transaction confirmation. The priority fee is a tip paid to validators to incentivize them to confirm your transaction sooner.')}
            icon={<GasIcon />}
            action={
              <a
                href={config.buy_native_token}
                title={t('Buy {{currency}}', { currency: NATIVE.SYMBOL })}
                target="_blank"
                rel="noopener noreferrer"
              >
                {t('Buy {{currency}}', { currency: NATIVE.SYMBOL })}
              </a>
            }
            message={
              t('Add at least {{amount}} {{currency}} for gas to play', {
                amount: htmlCurrency(config.suggested_gas),
                currency: NATIVE.SYMBOL
              })
            }
          />
        )}
        {!insufficientGas &&
          insufficientBalance &&
          currency === DEMO &&
          !hideDemo1000 && (
            <Notifications.Item
              className={cn({
                propagating: props.minting || props.confirmingMinting,
              })}
              icon={<WalletIcon />}
              action={t('+1,000')}
              onClick={demo_1000}
              message={t('Add {{currency}} to your wallet to play', {
                currency,
              })}
            />
          )}
          {!insufficientGas && insufficientBalance && currency !== DEMO && (
            <Notifications.Item
              icon={<WalletIcon />}
              onClick={getERC20}
              action={t('Add {{currency}}', { currency })}
              message={
                t('Add at least {{amount}} {{currency}} in order to play', {
                  amount: htmlCurrency(sub(game?.minWager, props.balance)),
                  currency
                })
              }
          />
        )}
        {!account && !inprogress && (
          <Notifications.Item
            icon={<WalletIcon />}
            action={t('Connect')}
            onClick={connecting}
            message={t('Web3 Wallet is Disconnected')}
          />
        )}
        {inprogress && (
          <Notifications.Item
            icon={<WalletIcon />}
            action={t('Retry')}
            onClick={restart}
            message={t('Complete activation in your web3 Wallet!')}
          />
        )}
      </Notifications.Widget>

      {!locked && (
        <div
          className={cn(css.betbar, {
            [css.disabled]: disabled,
            [css.warning]: warning,
          })}
        >
          <div className={css.bet}>
            <AnimatedButton
              className={cn(css.up, {
                propagating: confirmingUP,
                [css.flickering]: flickering,
                [css.hushed]: hushed,
              })}
              onClick={placePredictionUp}
              hoverBorderOpacity={0.46}
            >
              <div className={css.icon}>
                <ArrowUpIcon />
              </div>
              <div className={css.percent}>
                {percentageUP > 0
                  ? htmlPercentSigned(profitPercents[PRIZEFUNDS.UP])
                  : t('Up')}
              </div>
            </AnimatedButton>

            <AnimatedButton
              className={cn(css.zero, {
                propagating: confirmingEQUAL,
                [css.flickering]: flickering,
                [css.hushed]: hushed,
              })}
              onClick={placePredictionZero}
            >
              <div className={css.icon}>
                <ZeroIcon />
              </div>
              <div className={css.percent}>
                {percentageEQUAL > 0
                  ? htmlPercentSigned(profitPercents[PRIZEFUNDS.EQUAL])
                  : t('Zero')}
              </div>
            </AnimatedButton>

            <AnimatedButton
              className={cn(css.down, {
                propagating: confirmingDOWN,
                [css.flickering]: flickering,
                [css.hushed]: hushed,
              })}
              onClick={placePredictionDown}
            >
              <div className={css.icon}>
                <ArrowDownIcon />
              </div>
              <div className={css.percent}>
                {percentageDOWN > 0
                  ? htmlPercentSigned(profitPercents[PRIZEFUNDS.DOWN])
                  : t('Down')}
              </div>
            </AnimatedButton>
          </div>

          <WagerInput
            className={css.wager}
            key={game?.gameid}
            disabled={disabled}
            min={game?.minWager}
            max={props.balance}
            currency={currency}
            initialWager={wager}
            onChange={setWager}
          />
        </div>
      )}

      {locked && <BetBarLock endDate={round.endDate} />}
    </>
  )
}

export default connect(
  (state) => {
    const gameid = getActiveGameId(state)
    const game = getGameById(state, gameid)
    const account = getActiveAccountAddress(state)
    const round = getActualRound(state, gameid)
    const roundid = round?.roundid
    const erc20 = round?.erc20

    return {
      gameid,
      game,
      roundid,
      round,

      gas: getActiveAccountGas(state),

      balance: getActiveAccountBalance(state, game?.currency),
      allowance: getActiveAccountAllowance(state, game?.currency),
      account,

      confirmingUP: isLoading(state, PLACE_PREDICTION, [toPredictionId({ account, roundid, position: UP })]),
      confirmingDOWN: isLoading(state, PLACE_PREDICTION, [toPredictionId({ account, roundid, position: DOWN })]),
      confirmingEQUAL: isLoading(state, PLACE_PREDICTION, [toPredictionId({ account, roundid, position: EQUAL })]),

      approveing: !isEmpty(
        getPendingTransactionsByEntityId(
          state,
          hexHash({ APPROVE_ACCOUNT_ALLOWANCE, erc20 })
        )
      ),
      confirmingApprove: isLoading(state, APPROVE_ACCOUNT_ALLOWANCE, [erc20]),
      successApprove: isSucceed(state, APPROVE_ACCOUNT_ALLOWANCE, [erc20]),

      minting: !isEmpty(
        getPendingTransactionsByEntityId(state, hexHash({ MINT_DEMO_1000 }))
      ),
      confirmingMinting: isLoading(state, MINT_DEMO_1000),
      successMinting: isSucceed(state, MINT_DEMO_1000),

      inprogress: isLoading(state, WALLET_CONNECT),
    }
  },
  ({ query, command }) => [
    // NOTE: It's important to use query here in order to block interaction
    // until first action get resolved
    query(PLACE_PREDICTION),
    query(APPROVE_ACCOUNT_ALLOWANCE),
    query(MINT_DEMO_1000),

    command(SET_SHOW_CONNECT_BAR),
    command(START_SWAP),
  ]
)(React.memo(BetBar))
