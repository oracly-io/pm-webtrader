import React, { useCallback, useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import cn from 'clsx'
import { Virtuoso } from 'react-virtuoso'

import Load from '@components/SVG/Load'
import { useTranslate } from '@lib/i18n-utils'
import { usePrevious } from '@hooks'

import RoundTopBettorsListPrediction from '../RoundTopBettorsListPrediction'

import css from './RoundTopBettorsList.module.scss'

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
        <span className={css.loadMoreText}>
          {isLoading ? t('Loading...') : t('Load more predictions')}
        </span>
      </div>
    )
  }

  return null
}

const virtuoso = {
  computeItemKey: (index, prediction) => prediction?.predictionid,
  increaseViewportBy: { top: 100, bottom: 100 },
  components: { Footer: VirtuosoFooter },
}

const RoundTopBettorsList = (props) => {

  const {
    className,
    predictionClassName,
    predictions,
    round,
    game,
    customScrollParentRef,
  } = props

  const itemContent = useCallback((index, prediction) => (
    <RoundTopBettorsListPrediction
      className={predictionClassName}
      game={game}
      round={round}
      prediction={prediction}
    />
  ), [game, round])

  // Once we have parent make rerender to bind it's scroll to virtuoso.
  const [rendered, setrendered] = useState(false)
  useEffect(() => {
    if(!rendered && customScrollParentRef.current) setrendered(true)
  }, [customScrollParentRef.current, rendered])

  return (
    <div className={cn(css.container, className)}>
      <Virtuoso
        className={css.virtuoso}
        components={virtuoso.components}
        increaseViewportBy={virtuoso.increaseViewportBy}
        computeItemKey={virtuoso.computeItemKey}
        context={props.virtuosoContext}
        itemContent={itemContent}
        data={predictions}
        customScrollParent={customScrollParentRef.current}
      />
    </div>
  )
}

RoundTopBettorsList.propTypes = {
  className: PropTypes.string,
  predictionClassName: PropTypes.string,
  round: PropTypes.object.isRequired,
  game: PropTypes.object.isRequired,
  predictions: PropTypes.array,
}

export default React.memo(RoundTopBettorsList)
