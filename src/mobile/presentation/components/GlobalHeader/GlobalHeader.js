import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { isEmpty, isString, toLower, isNaN } from 'lodash'

import { success, fails } from '@oracly/pm-libs/redux-cqrs'
import { PMGlobalHeader } from '@oracly/pm-react-components/app/mobile'
import { useWallet } from '@oracly/pm-libs/crypto-wallet'
import { nowUnixTS } from '@oracly/pm-libs/date-utils'

import config from '@config'

import { GET_ALLOWANCE, GET_BALANCE, GET_GAS_BALANCE } from '@actions'
import { SET_ACCOUNT, SET_SHOW_CONNECT_BAR } from '@actions'
import { RESOVLE_ADDRESS_TO_NICKNAME } from '@actions'
import { SET_CURRENCY, UPDATE_NICKNAME } from '@actions'
import { REQUEST_AUTHENTICATION_PSIG } from '@actions'
import { SET_SHOW_STATISTICS_BAR } from '@actions'
import { WALLET_CONNECT } from '@actions'
import { CHAT_SEND } from '@actions'
import { TOGGLE_TOOLBAR } from '@actions'
import { SHOW_INSTALL_PROMPT } from '@actions'

import { TOOLBAR_PREDICTIONS, TOOLBAR_CHAT } from '@constants'
import { ERC20 } from '@constants'
import { CHAT_ENGLISH, NICKNAME_MSG } from '@constants'
import { UNPUBLISHED } from '@constants'
import { FEATURE_TOGGLES } from '@constants'

import Header from '@components/Header'

import { useScheduledQuery } from '@hooks'
import { useSupportBot } from '@hooks'

import { connect } from '@state'
import { isInProgress } from '@state/async'
import { getActiveAccountBalance, getActiveCurrency, getNetworkStatus } from '@state/getters'
import { isLoading } from '@state/getters'
import { getConnectBarIsOpened, getMentorStatistics } from '@state/getters'
import { getBettorStatistics, getStakerStatistics } from '@state/getters'
import { getActiveAuthPersonalSignature } from '@state/getters'
import { getActiveAccountAllowance } from '@state/getters'
import { getActiveAccountAddress } from '@state/getters'
import { getActiveAccountGas } from '@state/getters'
import { getStatisticsBarIsOpened } from '@state/getters'
import { getStatisticsBarAccount } from '@state/getters'
import { getLatestbcBlockNumber } from '@state/getters'
import { getAccountNickname } from '@state/getters'
import { pickAsyncStatus } from '@state/getters'
import { isAccountNicknameStatus } from '@state/getters'

import { isinstandalonemode } from '@utils'

import css from './GlobalHeader.module.scss'

const GlobalHeader = (props) => {
  const [injectedProviderType, setInjectedProviderType] = useState()
  const {
    psig,
    balance,
    currency,
    isConnecting,
    networkStatus,
    isConnectBarOpened,
    predictorStatistics,
    mentorStatistics,
    stakerStatistics,
    isStatisticsBarOpened,
    statisticsBarAccount,
    statisticsBarNickname,
  } = props

  const wallet = useWallet()
  const account = toLower(wallet.account)
  const erc20 = ERC20.ADDRESS[currency]

  const connectors = useMemo(
    () => {
      if (window.ethereum) {
        if (window.ethereum.isMetaMask || window.ethereum.isUniswapWallet) {
          return wallet.connectors.filter((con) => con === 'injected')
        }
        if (window.ethereum.isCoinbaseWallet) {
          return wallet.connectors.filter((con) => con === 'coinbase')
        }
        return wallet.connectors.filter((con) => con === 'walletconnect')
      } else {
        return wallet.connectors.filter((con) => con !== 'injected')
      }
    },
    [wallet.connectors]
  )

  useEffect(() => {
    if (connectors.includes('injected')) {
      if (window.ethereum) {
        setInjectedProviderType(window.ethereum?.isUniswapWallet ? 'uniswap' : 'metamask')
      } else {
        setInjectedProviderType('uniswap')
      }
    }
  }, [connectors])

  const statistics = useMemo(() => {
    return {
      predictor: predictorStatistics,
      mentor: mentorStatistics,
      staker: stakerStatistics,
    }
  }, [predictorStatistics, mentorStatistics, stakerStatistics])

  useScheduledQuery((query, state) => {

    const blockNumber = getLatestbcBlockNumber(state)
    if (
      wallet.ready &&
      blockNumber &&
      account &&
      erc20
    ) {

      const balance = getActiveAccountBalance(state, ERC20[erc20])
      const allowence = getActiveAccountAllowance(state, ERC20[erc20])
      const gas = getActiveAccountGas(state)

      let balanceSchedule = isNaN(Number(String(balance))) ? config.balance_update.first : config.balance_update.rest
      let gasSchedule = isNaN(Number(String(gas))) ? config.gas_update.first : config.gas_update.rest
      let allowanceSchedule = isNaN(Number(String(allowence))) ? config.allowence_update.first : config.allowence_update.rest

      query(GET_BALANCE, { account, erc20, txn: { blockNumber } }, { schedule: balanceSchedule })
      query(GET_GAS_BALANCE, { account, txn: { blockNumber } }, { schedule: gasSchedule })
      query(GET_ALLOWANCE, { account, erc20, txn: { blockNumber } }, { schedule: allowanceSchedule })

    }

  }, [wallet.ready, account, erc20])

  const inprogress = isInProgress(props, REQUEST_AUTHENTICATION_PSIG)
  useEffect(() => {
    if (!wallet.ready) return
    if (!wallet.chain) return
    if (!account) return
    if (account !== props.bettor) return
    if (!isEmpty(psig)) return
    if (!isString(props.nickname)) return
    if (inprogress) return

    props.REQUEST_AUTHENTICATION_PSIG({
      nickname: props.nickname,
      from: account,
    })
  }, [
    psig,
    wallet.chain,
    wallet.ready,
    account,
    props.bettor,
    props.nickname,
    inprogress,
  ])

  useEffect(() => {
    if (!wallet.ready) return
    if (!wallet.chain) return
    if (!account) return
    if (account !== props.bettor) return
    if (isString(props.nickname)) return

    props.RESOVLE_ADDRESS_TO_NICKNAME({ address: account })
  }, [wallet.chain, wallet.ready, account, props.bettor, props.nickname])

  useEffect(() => {
    if (!wallet.ready) return
    if (!wallet.chain) return
    if (!account) return
    if (account !== props.bettor) return
    if (isEmpty(psig)) return
    if (!props.unpublished) return

    // commiting new nickname by share via chat
    props.CHAT_SEND({
      sender: account,
      nickname: props.nickname,
      channel: CHAT_ENGLISH,
      type: NICKNAME_MSG,
      cts: nowUnixTS(),
      psig,
    })
  }, [
    psig,
    wallet.chain,
    wallet.ready,
    account,
    props.bettor,
    props.nickname,
    props.uncommited,
  ])

  useEffect(() => {
    if (wallet.ready) {
      props.SET_ACCOUNT({ account: account || null })
    }
  }, [wallet.ready, account])

  useEffect(() => {
    props.WALLET_CONNECT()
    wallet.actions
      .connectEagerly()
      .then(() => props.WALLET_CONNECT_SUCCESS())
      .catch(() => props.WALLET_CONNECT_FAILS())
  }, [])

  const handleConnectClick = useCallback(() => {
    if (!isConnecting) props.SET_SHOW_CONNECT_BAR({ isOpened: true })
  }, [isConnecting])

  const handleConnectBarCloseClick = useCallback(() => {
    props.SET_SHOW_CONNECT_BAR({ isOpened: false })
  }, [])

  const handleDisconnectClick = useCallback(() => {
    props.SET_SHOW_STATISTICS_BAR({ isOpened: false })
    if (wallet.ready) {
      wallet.actions.disconnect()
      props.SET_ACCOUNT({ account: null })
    }
  }, [wallet])

  const handleConnectorClick = useCallback((connectorId) => {
    // NOTE: it's handled via standard async
    // so we HAVE TO call sucess and fails
    props.WALLET_CONNECT()
    wallet.actions
      .connect(connectorId)
      .then(() => props.WALLET_CONNECT_SUCCESS())
      .catch(() => props.WALLET_CONNECT_FAILS())

    props.SET_SHOW_CONNECT_BAR({ isOpened: false })
  }, [])

  const handleProfileIconClick = useCallback(() => {
    props.SET_SHOW_STATISTICS_BAR({ account, isOpened: true })
  }, [account])

  const handleStatisticsBarCloseClick = useCallback(() => {
    props.SET_SHOW_STATISTICS_BAR({ isOpened: false })
  }, [])

  const handleChangeCurrency = useCallback((currency) => {
    props.SET_CURRENCY({ currency })
  }, [])

  const handleNicknameChanged = useCallback(({ address, nickname }) => {
    props.UPDATE_NICKNAME({ address, nickname })
  }, [])

  const onPredictionsClick = () =>
    props.TOGGLE_TOOLBAR({ type: TOOLBAR_PREDICTIONS })
  const onChatClick = () => props.TOGGLE_TOOLBAR({ type: TOOLBAR_CHAT })

  const isConnected = useMemo(
    () =>
      !!(
        wallet &&
        wallet.ready &&
        wallet.chain &&
        toLower(wallet.account) === props.bettor
      ),
    [wallet, props.bettor]
  )

  const handleInstallAppClick = useCallback(() => props.SHOW_INSTALL_PROMPT({ showInstallPrompt: true }), [])

  const [handleSupportClick,] = useSupportBot()

  return (
    <PMGlobalHeader
      injectedProviderType={injectedProviderType}
      headerClassName={css.header}
      connectClassName={css.connect}
      basepath={config.pm_base_path}
      logoFill="#D0D7FF"
      logoLabelFill="#D0D7FF"
      currencyFill="#303550"
      maximumFractionDigits={config.maximum_fraction_digits}
      maximumFractionDigitsPrecent={config.maximum_fraction_digits_precent}
      showInstallApp={!isinstandalonemode}
      content={
        <Header
          balance={balance}
          currency={currency}
          account={account}
          isConnected={isConnected}
          networkStatus={networkStatus}
          onProfileCurrencyChanged={handleChangeCurrency}
          onProfileIconClick={handleProfileIconClick}
          onPredictionsClick={onPredictionsClick}
          onChatClick={onChatClick}
        />
      }
      isConnected={isConnected}
      isConnecting={isConnecting}
      isConnectBarOpened={isConnectBarOpened}
      isStatisticsBarOpened={isStatisticsBarOpened}
      account={account}
      nickname={props.nickname}
      statisticsAccount={statisticsBarAccount}
      statisticsNickname={statisticsBarNickname}
      balance={balance}
      currency={currency}
      chainName={wallet.chain?.chainName}
      connectors={connectors}
      activeNavigationItem="trade"
      statistics={statistics}
      featureToggles={FEATURE_TOGGLES}
      onConnectorClick={handleConnectorClick}
      onConnectClick={handleConnectClick}
      onDisconnectClick={handleDisconnectClick}
      onConnectBarCloseClick={handleConnectBarCloseClick}
      onStatisticsBarCloseClick={handleStatisticsBarCloseClick}
      onCurrencyChanged={handleChangeCurrency}
      onNicknameChanged={handleNicknameChanged}
      onInstallAppClick={handleInstallAppClick}
      onSupportClick={handleSupportClick}
    >
      {props.children}
    </PMGlobalHeader>
  )
}

export default connect(
  (state) => {
    const currency = getActiveCurrency(state)
    const balance = getActiveAccountBalance(state, currency)
    const isConnectBarOpened = getConnectBarIsOpened(state)
    const isStatisticsBarOpened = getStatisticsBarIsOpened(state)
    const statisticsBarAccount = getStatisticsBarAccount(state)
    const statisticsBarNickname = getAccountNickname(
      state,
      statisticsBarAccount
    )
    const predictorStatistics = getBettorStatistics(state, statisticsBarAccount)
    const stakerStatistics = getStakerStatistics(state, statisticsBarAccount)
    const mentorStatistics = getMentorStatistics(state, statisticsBarAccount)
    const bettor = getActiveAccountAddress(state)
    const nickname = getAccountNickname(state, bettor)
    const unpublished = isAccountNicknameStatus(state, bettor, UNPUBLISHED)
    const psig = getActiveAuthPersonalSignature(state)
    const isConnecting = isLoading(state, WALLET_CONNECT)
    const networkStatus = getNetworkStatus(state)

    return {
      psig,
      bettor,
      balance,
      nickname,
      currency,
      unpublished,
      isConnecting,
      networkStatus,
      isConnectBarOpened,
      isStatisticsBarOpened,
      predictorStatistics,
      mentorStatistics,
      stakerStatistics,
      statisticsBarAccount,
      statisticsBarNickname,

      ...pickAsyncStatus(state, REQUEST_AUTHENTICATION_PSIG),
    }
  },
  ({ query, command }) => [
    command(SET_ACCOUNT),
    command(SET_CURRENCY),
    command(SET_SHOW_CONNECT_BAR),
    command(SET_SHOW_STATISTICS_BAR),
    command(UPDATE_NICKNAME),

    command(WALLET_CONNECT),
    command(success(WALLET_CONNECT)),
    command(fails(WALLET_CONNECT)),

    command(CHAT_SEND),
    command(TOGGLE_TOOLBAR),
    command(SHOW_INSTALL_PROMPT),
    query(RESOVLE_ADDRESS_TO_NICKNAME),
    query(REQUEST_AUTHENTICATION_PSIG),
  ]
)(React.memo(GlobalHeader))
