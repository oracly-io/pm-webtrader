import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { isEmpty, debounce, keys, map, groupBy, size } from 'lodash'
import cn from 'clsx'

import config from '@config'
import logger from '@lib/logger'

import { StickChart, EChartType } from '@oracly/pm-stickchart'
import { useFeatureToggles } from '@oracly/pm-react-components/app/features'


import { connect } from '@state'
import { isSucceed, isInProgress, isNeverPerformed } from '@state/async'

import { useScheduledQuery } from '@hooks'

import { GET_PRICE_FEED } from '@actions'
import { WITHDRAW, RESOLVE_WITHDRAW } from '@actions'
import { GET_SETTLEMENTS_BY_IDS } from '@actions'
import { RESOLVE_WITHDRAW_NOCONTEST } from '@actions'
import { FOCUS_ROUND, UNFOCUS_ROUND } from '@actions'
import { TIMEFRAME_NOW_STICK, TIMEFRAME_NOW_UNSTICK } from '@actions'
import { READ_BLOCKCHAIN_LATEST_ROUNDS_BY_GAMEID } from '@actions'
import { TIMEFRAME_RESET } from '@actions'

import { getActiveGameChartData, getPendingTransactions } from '@state/getters'
import { getChartTimeframeReset } from '@state/getters'
import { getTransactionsCollection, getTransactionsEntities } from '@state/getters'
import { getBlocksEntities, getBlockLatest } from '@state/getters'
import { getActiveGameBettorPredictions, getActiveGameSettlmentsByIds } from '@state/getters'
import { getActiveGame, pickAsyncStatus, getActiveAccountAddress } from '@state/getters'
import { getMissingSettlments } from '@state/getters'
import { getLatestbcBlockNumber } from '@state/getters'
import { getRoundsForChart } from '@state/getters'
import { getFocusRoundId } from '@state/getters'

import { toAccountAvatarUrl } from '@utils'

import css from '@styles/components/content/chart.module.scss'

export const Chart = (props) => {
  const stageRef = useRef(null)
  const chartRef = useRef(null)

  const [chartType/*, setChartType */] = useState(EChartType.LINE)
  const [chart, setChart] = useState()
  const [hide, setHide] = useState(false)
  const [ready, setReady] = useState(false)
  const { features } = useFeatureToggles()

  const succeed = isSucceed(props, GET_PRICE_FEED)

  const bettor = props.bettor
  const gameid = props.game?.gameid
  const blockNumber = props.blockNumber

  useEffect(() => {
    if (!ready && succeed && chart && props.game?.schedule) {
      chart.setTimeframe(props.game?.schedule * 3)
      setReady(true)
    }
  }, [
    succeed,
    chart,
    props.game?.schedule
  ])

  useEffect(() => {
    if (chart && props.game?.schedule) {
      chart.setTimeframe(props.game?.schedule * 3)
    }
  }, [
    chart,
    props.game?.schedule
  ])


  useScheduledQuery((query) => {
    if (!isEmpty(props.missingSettlements)) {

      for (const pricefeed in props.missingSettlements) {
        const settlmentids = keys(props.missingSettlements[pricefeed])
        if (!isEmpty(settlmentids)) {
          query(GET_SETTLEMENTS_BY_IDS, { pricefeed, settlmentids }, { schedule: 5 })
        }
      }

    }
  }, [props.missingSettlements])

  useEffect(() => {
    if (isNeverPerformed(props, GET_PRICE_FEED)) setReady(false)
  }, [props.game?.pricefeed])

  const isloading = isInProgress(props, READ_BLOCKCHAIN_LATEST_ROUNDS_BY_GAMEID)
  useEffect(() => { setHide(isloading) }, [isloading])
  useEffect((state) => {
    const firstReq = isNeverPerformed(props, READ_BLOCKCHAIN_LATEST_ROUNDS_BY_GAMEID)
    if (gameid && blockNumber && firstReq) {
      props.READ_BLOCKCHAIN_LATEST_ROUNDS_BY_GAMEID({ gameid, txn: { blockNumber } })
    }
  }, [gameid, blockNumber])

  useLayoutEffect(() => {
    const options = {
      positioningFlickeringAt: config.entry_flickering_at,
      positioningHushedAt: config.entry_hushed_at,
    }
    const stickchart = new StickChart(stageRef.current, options)
    setChart(stickchart)

    return () => stickchart.destroy()
  }, [])

  const refhide = useRef(hide)
  useEffect(() => {
    refhide.current = hide
  }, [hide])

  useEffect(() => {
    if (!chart) return
    logger.info('append chart')

    chartRef.current.appendChild(chart.canvas)

    // resize
    const element = stageRef.current
    const debounced = debounce(() => setHide(false), 300)
    const observer = new ResizeObserver(([{ contentRect: { width, height } }]) => {
      if (!refhide.current) setHide(true)
      debounced()
      chart.setScreenSize({ width, height })
    })
    observer.observe(element)

    // subscribes
    chart.addEventListener('error', (e) => window.location.href = window.location.href) // eslint-disable-line
    chart.addEventListener(
      'withdraw', (e) => {
        if (e.predictionid && e.erc20 && e.roundid) {
          props.WITHDRAW({
            roundid: e.roundid,
            predictionid: e.predictionid,
            erc20: e.erc20
          })
        }
      }
    )
    chart.addEventListener(
      'resolvewithdraw', (e) => {
        if (e.roundid && e.predictionid && e.erc20 && e.exitPrice?.roundid && e.controlPrice?.roundid) {
          props.RESOLVE_WITHDRAW({
            roundid: e.roundid,
            predictionid: e.predictionid,
            erc20: e.erc20,
            resolution: e.exitPrice.roundid,
            control: e.controlPrice.roundid,
          })
        }
      }
    )
    chart.addEventListener(
      'resolvewithdrawnocontest', (e) => {
        if (e.roundid && e.predictionid && e.erc20) {
          props.RESOLVE_WITHDRAW_NOCONTEST({
            roundid: e.roundid,
            predictionid: e.predictionid,
            erc20: e.erc20,
          })
        }
      }
    )
    chart.addEventListener(
      'roundpin', (e) => {
        if (e.roundid) {
          props.FOCUS_ROUND({ roundid: e.roundid })
        }
      }
    )
    chart.addEventListener(
      'roundunpin', (e) => {
        if (e.roundid) {
          props.UNFOCUS_ROUND({ roundid: e.roundid })
        }
      }
    )
    chart.addEventListener(
      'timeframeTonow', (e) => {
        props.TIMEFRAME_NOW_STICK()
      }
    )
    chart.addEventListener(
      'timeframeUnnow', (e) => {
        props.TIMEFRAME_NOW_UNSTICK()
      }
    )

    // one frame debounce
    chart.render = debounce(chart.render, 30)

  }, [chart])

  useEffect(() => {
    if (props.resetTimeframe) {
      chart.resetTimeframe()
      props.TIMEFRAME_RESET({ needreset: false })
    }
  }, [chart, props.resetTimeframe])

  useEffect(() => {
    if (!chart) return
    if (!ready) return
    if (isEmpty(props.chartdata)) return
    if (hide) return

    chart.render({
      focusroundid: props.focusroundid,
      chartdata: props.chartdata,
      charttype: chartType,
      game: props.game,
      rounds: props.rounds,
      predictions: props.predictions,
      settlments: props.settlments,
      blocksLatest: props.blocksLatest,
      transactions: props.transactions,
      blocksEntities: props.blocksEntities,
      transactionsEntities: props.transactionsEntities,
      features,
      bettor: { avatarUrl: toAccountAvatarUrl(bettor) },
    })

  }, [
    chart,
    chartType,

    hide,
    ready,

    props.roundsKey,
    props.predictionsKey,
    props.gameKey,
    props.chartdataKey,
    props.settlmentsKey,
    props.blocksLatestKey,
    props.transactionsKey,
    props.blocksEntitiesKey,
    props.focusroundid,
    features,
    bettor,
  ])

  return (
    <div
      ref={stageRef}
      className={cn(css.chartstage, {
        [css.rendering]: hide || !ready
      })}
    >
      <div
        ref={chartRef}
        className={css.chart}
      />
    </div>
  )
}

export default connect(
  state => {
    const bettor = getActiveAccountAddress(state)
    const game = getActiveGame(state)
    const rounds = getRoundsForChart(state, game?.gameid)
    const predictions = groupBy(getActiveGameBettorPredictions(state, bettor), 'roundid')
    const chartdata = getActiveGameChartData(state)
    const settlments = getActiveGameSettlmentsByIds(state, map(rounds, 'endDate'))
    const missingSettlements = getMissingSettlments(state)
    const transactions = getTransactionsCollection(state)
    const transactionsPending = getPendingTransactions(state)
    const transactionsEntities = getTransactionsEntities(state)
    const blocksEntities = getBlocksEntities(state)
    const blocksLatest = getBlockLatest(state)
    const resetTimeframe = getChartTimeframeReset(state)
    const focusroundid = getFocusRoundId(state)

    const blockNumber = getLatestbcBlockNumber(state)

    return {
      chartdata,
      chartdataKey: JSON.stringify(chartdata),

      game,
      gameKey: JSON.stringify(game),

      rounds,
      roundsKey: JSON.stringify(rounds),

      predictions,
      predictionsKey: JSON.stringify(predictions),

      settlments,
      settlmentsKey: JSON.stringify(settlments),

      missingSettlements,

      bettor,

      transactions,
      transactionsKey: size(transactions) + size(transactionsPending),
      transactionsEntities,

      blocksLatest,
      blocksLatestKey: JSON.stringify(blocksLatest),

      blockNumber,

      blocksEntities,
      blocksEntitiesKey: JSON.stringify(blocksEntities),

      resetTimeframe,

      focusroundid,

      ...pickAsyncStatus(state, GET_PRICE_FEED, [game?.pricefeed]),
      ...pickAsyncStatus(state, READ_BLOCKCHAIN_LATEST_ROUNDS_BY_GAMEID, [game?.gameid]),
    }
  },
  ({ command, query }) => [
    command(WITHDRAW),
    command(FOCUS_ROUND),
    command(UNFOCUS_ROUND),
    command(RESOLVE_WITHDRAW),
    command(RESOLVE_WITHDRAW_NOCONTEST),

    command(TIMEFRAME_NOW_STICK),
    command(TIMEFRAME_NOW_UNSTICK),
    command(TIMEFRAME_RESET),

    query(READ_BLOCKCHAIN_LATEST_ROUNDS_BY_GAMEID),

    query(GET_SETTLEMENTS_BY_IDS),
  ]
)(React.memo(Chart))
