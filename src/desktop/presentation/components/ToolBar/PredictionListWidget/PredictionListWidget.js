import React, { useCallback, useEffect, forwardRef, useMemo } from 'react'
import { map, isEmpty, orderBy, keys } from 'lodash'
import { Virtuoso } from 'react-virtuoso'

import { GET_LATEST_PRICE_FEED, GET_SETTLEMENTS_BY_IDS } from '@actions'
import { READ_BLOCKCHAIN_LATEST_PREDICTIONS_BY_ADDRESS } from '@actions'

import { LT } from '@constants'

import Load from '@components/SVG/Load'

import { useScheduledQuery, usePrevious } from '@hooks'

import { useTranslate } from '@lib/i18n-utils'

import { connect } from '@state'
import { getPredictionsTotalSizeByAddress, getBettorPredictionIds, isScrollFailed, isScrollLoading } from '@state/getters'
import { getPredictionsByIds, getPredictionsLoadedSizeByAddress, getRoundsByIds } from '@state/getters'
import { getPredictionsListOffset, getLatestbcBlockNumber } from '@state/getters'
import { getPredictionsMissingRoundIds, getMissingSettlments } from '@state/getters'
import { getActiveAccountAddress } from '@state/getters'

import { getActualRoundsPricefeeds } from '@utils'

import Prediction from './Prediction'
import EmptyPredictions from './EmptyPredictions'

import css from './PredictionListWidget.module.scss'
import predictioncss from './Prediction/Prediction.module.scss'

const VirtuosoList = forwardRef((props, ref) => <div className={css.list} {...props} ref={ref} />)
VirtuosoList.displayName = 'VirtuosoList'

const VirtuosoItem = ({ item, ...props }) => <div className={predictioncss.container} {...props} />

const VirtuosoFooter = ({ context: {
  loadMore,
  hasMore,
  isFailed,
  isLoading,
} }) => {
  const t = useTranslate()

  const prevIsFailed = usePrevious(isFailed)

  if (hasMore && (isFailed || prevIsFailed && isLoading)) {
    return (
      <div className={css.footer} onClick={loadMore}>
        <div className={css.loadMoreIcon}>
          <Load />
        </div>
        <span className={css.loadMoreText}>{isLoading ? t('Loading...') : t('Load more predictions')}</span>
      </div>
    )
  }

  return null
}

const virtuoso = {
  styles: { height: '100%' },
  increaseViewportBy: { top: 200, bottom: 200 },
  components: { List: VirtuosoList, Item: VirtuosoItem, Footer: VirtuosoFooter },
  computeItemKey: (index, prediction) => prediction?.predictionid,
  itemContent: (index, prediction) => <Prediction predictionid={prediction.predictionid} />,
}

const PredictionListWidget = (props) => {
  const t = useTranslate()

  useEffect(() => {
    if (!isEmpty(props.pricefeeds)) {
      for(const pricefeed of props.pricefeeds) {
        props.GET_LATEST_PRICE_FEED({ pricefeed })
      }
    }
  }, [props.pricefeedsHash])

  useScheduledQuery((query) => {
    if (!isEmpty(props.missingSettlements)) {

      for (const pricefeed in props.missingSettlements) {
        const settlmentids = Object.keys(props.missingSettlements[pricefeed])
        if (!isEmpty(settlmentids)) {
          query(GET_SETTLEMENTS_BY_IDS, { pricefeed, settlmentids }, { schedule: 5 })
        }
      }

    }
  }, [props.missingSettlements])

  useScheduledQuery((query, state) => {
    if (props.bettorid) {
      const predictionids = getBettorPredictionIds(state, props.bettorid)
      const predictions = getPredictionsByIds(state, predictionids)
      const rounds = getRoundsByIds(state, map(predictions, 'roundid'))
      const pricefeeds = getActualRoundsPricefeeds(rounds)
      for(const pricefeed of pricefeeds) {
        query(GET_LATEST_PRICE_FEED, { pricefeed }, { schedule: 5 })
      }
    }
  }, [props.bettorid])

  const data = useMemo(
    () => orderBy(props.predictions, 'priotiry', ['desc']),
    [keys(props.predictions).join('')]
  )

  const loadMore = useCallback(() => {
    if (props.bettorid && props.offset && props.blockNumber) {
      props.READ_BLOCKCHAIN_LATEST_PREDICTIONS_BY_ADDRESS({
        address: props.bettorid,

        offset: props.offset,
        txn: { blockNumber: props.blockNumber },

        loadType: LT.SCROLL,
      })
    }
  }, [props.bettorid, props.offset, props.blockNumber])

  const atBottomStateChangeHandler = useCallback((atBottom) => {
    if (atBottom) loadMore()
  }, [loadMore])

  const virtuosoContext = useMemo(() => ({
    loadMore,
    hasMore: props.hasMorePredictions,
    isFailed: props.loadPredictionsFailed,
    isLoading: props.loadPredictionsInProgress,
  }), [loadMore, props.hasMorePredictions, props.loadPredictionsFailed, props.loadPredictionsInProgress])

  const loadedSize = Math.min(props.loadedSize, props.totalSize)
  const totalSize = props.totalSize

  return (
    <div className={css.predictionlistwidget}>

      <div className={css.header}>
        <div className={css.title}>{t('Activity')}</div>
        {!!loadedSize && !!totalSize && (
          <div className={css.sizes}>
            <span className={css.loaded}>{loadedSize}</span>
            <div>/</div>
            <span className={css.total}>{totalSize}</span>
          </div>
        )}
      </div>

      <div className={css.body}>
        {!isEmpty(data) ? (
          <Virtuoso
            context={virtuosoContext}
            style={virtuoso.styles}
            itemContent={virtuoso.itemContent}
            computeItemKey={virtuoso.computeItemKey}
            components={virtuoso.components}
            increaseViewportBy={virtuoso.increaseViewportBy}
            data={data}
            atBottomStateChange={atBottomStateChangeHandler}
          />
        ) : (
          <EmptyPredictions />
        )}
      </div>

    </div>
  )
}

export default connect(
  state => {
    const bettorid = getActiveAccountAddress(state)
    const predictionids = getBettorPredictionIds(state, bettorid)
    const predictions = getPredictionsByIds(state, predictionids)
    const offset = getPredictionsListOffset(state, bettorid)
    const rounds = getRoundsByIds(state, map(predictions, 'roundid'))

    const missingRoundids = getPredictionsMissingRoundIds(state)
    const missingSettlements = getMissingSettlments(state)

    const pricefeeds = getActualRoundsPricefeeds(rounds)
    const blockNumber = getLatestbcBlockNumber(state)

    const loadedSize = getPredictionsLoadedSizeByAddress(state, bettorid)
    const totalSize = getPredictionsTotalSizeByAddress(state, bettorid)
    const hasMorePredictions = loadedSize < totalSize
    const loadPredictionsFailed = isScrollFailed(state, READ_BLOCKCHAIN_LATEST_PREDICTIONS_BY_ADDRESS, [bettorid])
    const loadPredictionsInProgress = isScrollLoading(state, READ_BLOCKCHAIN_LATEST_PREDICTIONS_BY_ADDRESS, [bettorid])

    return {
      bettorid,
      predictions,
      offset,

      loadedSize,
      totalSize,

      hasMorePredictions,
      loadPredictionsFailed,
      loadPredictionsInProgress,

      missingRoundids,
      missingSettlements,
      blockNumber,

      pricefeeds,
      pricefeedsHash: JSON.stringify(pricefeeds),
    }
  },
  ({ query }) => [
    query(GET_LATEST_PRICE_FEED),
    query(READ_BLOCKCHAIN_LATEST_PREDICTIONS_BY_ADDRESS),
  ]
)(React.memo(PredictionListWidget))
