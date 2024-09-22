import React, { useCallback, useEffect, useState, useMemo, useRef } from 'react'
import PropTypes from 'prop-types'
import { isEmpty, pickBy, throttle, values } from 'lodash'
import cn from 'clsx'

import { LT } from '@constants'
import RoundGroupTitle from '@components/common/RoundInfo/RoundGroupTitle'
import { connect } from '@state'
import { READ_BLOCKCHAIN_LATEST_PREDICTIONS_BY_ROUNDID } from '@state/actions'
import { getRoundTopWinnerPredictions, getRoundTopBettorPredictions } from '@state/getters'
import { isScrollFailed, isScrollLoading } from '@state/getters'
import { getPredictionsLoadedSizeByRound, getPredictionsTotalSizeByRound } from '@state/getters'
import { getLatestbcBlockNumber, getTopPredictionsListOffset } from '@state/getters'
import { useTranslate } from '@lib/i18n-utils'
import { isActualRound } from '@utils'
import { isRoundResolvedWithContest } from '@utils'

import RoundTopBettorsTag from '../RoundTopBettorsTag'
import RoundTopBettorsList from '../RoundTopBettorsList'

import css from './RoundHistory.module.scss'

const getlist = (round, bettors, winners) => {
  let predictions = bettors
  if (isRoundResolvedWithContest(round)) {
    if (isEmpty(winners)) predictions = pickBy(bettors, { position: round.resolution })
    else predictions = winners
  }

  return predictions
}

const LOAD_OFFSET_PX = 56

const RoundHistory = (props) => {
  const {
    className,
    tagClassName,
    predictionClassName,
    titleClassName,
    round,
    game,
    winners,
    bettors,
    customScrollParentRef,
  } = props

  const t = useTranslate()

  const blockNumber = props.blockNumber
  const isActual = isActualRound(round)
  const isResolved = isRoundResolvedWithContest(round)
  const [showpeers, setShowpeers] = useState(false)
  useEffect(() => { setShowpeers(false) }, [round.roundid])

  useEffect((state) => {
    if (round.roundid && !isActual && blockNumber) {
      const query = {
        roundid: round.roundid,
        txn: { blockNumber }
      }
      if (!showpeers && isResolved) query.position = round.resolution

      props.READ_BLOCKCHAIN_LATEST_PREDICTIONS_BY_ROUNDID(query)
    }
  }, [round.roundid, isActual, isResolved, round.resolution, !!blockNumber, showpeers])

  const blockNumberRef = useRef(blockNumber)
  useEffect(() => {
    blockNumberRef.current = blockNumber
  }, [blockNumber])

  const loadMore = useCallback(() => {
    const blockNumber = blockNumberRef.current
    if (round.roundid && props.offset && blockNumber) {

      const query = {
        roundid: round.roundid,
        offset: props.offset,
        loadType: LT.SCROLL,
        txn: { blockNumber },
      }

      if (!showpeers && isResolved) query.position = round.resolution

      props.READ_BLOCKCHAIN_LATEST_PREDICTIONS_BY_ROUNDID(query)
    }
  }, [round.roundid, round.resolution, props.offset, isResolved, showpeers])

  useEffect(() => {
    if (customScrollParentRef.current) {
      let prevScrollTop
      const onScroll = throttle((e) => {

        const scrollTop = e.target.scrollTop
        prevScrollTop = scrollTop
        const scrollHeight = e.target.scrollHeight
        const clientHeight = e.target.clientHeight

        const isScrollingDown = prevScrollTop <= scrollTop
        const atLoadingOffset = scrollTop + clientHeight + LOAD_OFFSET_PX >= scrollHeight

        if (isScrollingDown && atLoadingOffset) loadMore()

      }, 300)

      customScrollParentRef.current.addEventListener('scroll', onScroll, { passive: true })
      return () => customScrollParentRef.current?.removeEventListener('scroll', onScroll)
    }
  }, [customScrollParentRef.current, loadMore])

  const onShowpeers = useCallback(() => (!showpeers && setShowpeers(true)), [showpeers])
  const onShowdefault = useCallback(() => (showpeers && setShowpeers(false)), [showpeers])

  let predictions = getlist(round, bettors, winners)

  if (showpeers) predictions = bettors
  predictions = values(predictions)

  const virtuosoContext = useMemo(() => ({
    loadMore,
    hasMore: props.hasMorePredictions,
    isFailed: props.loadPredictionsFailed,
    isLoading: props.loadPredictionsInProgress,
  }), [
    loadMore,
    props.hasMorePredictions,
    props.loadPredictionsFailed,
    props.loadPredictionsInProgress,
  ])

  if (isEmpty(predictions)) return null

  return (
    <>
      <RoundGroupTitle
        className={titleClassName}
        title={
          <span className={cn(css.peersbtn, { [css.inactive]: showpeers })} onClick={onShowdefault}>
            {isRoundResolvedWithContest(round) ? t('Winners') : t('Peers')}
          </span>
        }
      >
        {isRoundResolvedWithContest(round) &&
          <span className={cn(css.peersbtn, { [css.inactive]: !showpeers })} onClick={onShowpeers}>
            {t('Peers')}
          </span>
        }
      </RoundGroupTitle>
      <div className={cn(css.container, className)}>
        <RoundTopBettorsTag
          className={tagClassName}
          round={round}
          predictions={predictions}
        />
        <RoundTopBettorsList
          customScrollParentRef={customScrollParentRef}
          predictionClassName={predictionClassName}
          round={round}
          game={game}
          predictions={predictions}
          virtuosoContext={virtuosoContext}
        />
      </div>
    </>
  )
}

RoundHistory.propTypes = {
  className: PropTypes.string,
  tagClassName: PropTypes.string,
  predictionClassName: PropTypes.string,
  titleClassName: PropTypes.string,
  round: PropTypes.object,
  game: PropTypes.object,
}

export default connect(
  (state, { round }) => {
    const position = isRoundResolvedWithContest(round) ? round.resolution : undefined
    const loadedSize = getPredictionsLoadedSizeByRound(state, round.roundid, position)
    const totalSize = getPredictionsTotalSizeByRound(state, round.roundid, position)
    const hasMorePredictions = loadedSize < totalSize
    const loadPredictionsFailed = isScrollFailed(state, READ_BLOCKCHAIN_LATEST_PREDICTIONS_BY_ROUNDID, [round.roundid])
    const loadPredictionsInProgress = isScrollLoading(state, READ_BLOCKCHAIN_LATEST_PREDICTIONS_BY_ROUNDID, [round.roundid])

    return {
      blockNumber: getLatestbcBlockNumber(state),
      winners: getRoundTopWinnerPredictions(state, round.roundid),
      bettors: getRoundTopBettorPredictions(state, round.roundid),
      offset: getTopPredictionsListOffset(state, round.roundid, position),
      hasMorePredictions,
      loadPredictionsFailed,
      loadPredictionsInProgress,
    }
  },
  ({ query }) => [
    query(READ_BLOCKCHAIN_LATEST_PREDICTIONS_BY_ROUNDID),
  ]
)(React.memo(RoundHistory))
