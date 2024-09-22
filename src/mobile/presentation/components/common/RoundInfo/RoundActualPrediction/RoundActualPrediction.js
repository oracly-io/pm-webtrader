import React from 'react'
import PropTypes from 'prop-types'
import cn from 'clsx'
import { isEmpty, map } from 'lodash'
import { actualReturn, profitPercent } from '@oracly/pm-libs/calc-utils'
import { htmlCurrency, htmlCurrencyNamed } from '@oracly/pm-libs/html-utils'
import { htmlPercentSigned } from '@oracly/pm-libs/html-utils'

import { DOWN, UP, EQUAL, NOCONTEST, UNDEFINED } from '@constants'

import WageredDownIcon from '@components/SVG/WageredDownIcon'
import WageredUpIcon from '@components/SVG/WageredUpIcon'
import WageredZeroIcon from '@components/SVG/WageredZeroIcon'
import LevelCurrency from '@components/common/Currency/Level'

import { useTranslate } from '@lib/i18n-utils'

import { connect } from '@state'
import {
  getRelationNotifications,
  getLatestPriceByPricefeed,
  getSettlmentById,
} from '@state/getters'
import { isEnityReverted, isEntityPropagating } from '@state/getters'
import { isNoContestEmptyRound } from '@utils'
import { getRoundResolutionDynamic } from '@utils'
import { isHistoricalRound } from '@utils'

import PredictionNotification from './PredictionNotification'

import css from './RoundActualPrediction.module.scss'

const RoundActualPrediction = (props) => {
  const notifications = props.notifications
  const winClassName = props.winClassName
  const propagating = props.propagating
  const game = props.game
  const round = props.round
  const prediction = props.prediction
  const orphan = props.orphan

  const phantom = prediction.phantom
  const undef = resolution === UNDEFINED
  const resolution = getRoundResolutionDynamic(
    round,
    props.latestPrice,
    props.settlment
  )
  const nocontest = resolution === NOCONTEST && !phantom
  const emptyround = isNoContestEmptyRound(round)
  const win = prediction.position === resolution && !phantom
  const claimed = prediction.claimed
  const isHistorical = isHistoricalRound(round, props.settlment) && !phantom
  const winning = win && !isHistorical && !phantom

  const t = useTranslate()

  const predictionPositions = {
    [UP]: t('Up'),
    [DOWN]: t('Down'),
    [EQUAL]: t('Zero'),
  }

  let prize = 0
  if (claimed) {
    prize = prediction.payout
  } else if (nocontest || emptyround) {
    prize = prediction.wager
  } else if (win) {
    prize = actualReturn(
      round.prizefunds,
      prediction.wager,
      prediction.position
    )
  }

  const awarded = !!prize && prize !== prediction.wager

  return (
    <div
      className={cn(css.container, {
        [css.win]: win && awarded,
        [winClassName]: winClassName && win && awarded,
        [css.orphan]: orphan,
        [css.winning]: winning && awarded,

        propagating,
      })}
    >
      <div className={css.content}>
        <div className={css.wager}>
          <span
            className={css.position}
            title={[
              predictionPositions[prediction.position],
              htmlCurrencyNamed(prediction.wager, game.currency),
            ].join(' ')}
          >
            {prediction.position === UP && <WageredUpIcon />}
            {prediction.position === DOWN && <WageredDownIcon />}
            {prediction.position === EQUAL && <WageredZeroIcon />}
          </span>
          <span className={css.value}>{htmlCurrency(prediction.wager)}</span>
          <LevelCurrency
            className={css.level}
            currency={game.currency}
            type={game.level}
          />
        </div>
        <div
          className={cn(css.payout, { [css.hidden]: undef || phantom })}
          title={htmlCurrencyNamed(prize, game.currency)}
        >
          <span>{htmlCurrency(prize)}</span>
          <LevelCurrency
            className={css.level}
            currency={game.currency}
            type={game.level}
          />
          {awarded && (
            <div className={css.percentage}>
              {htmlPercentSigned(profitPercent(prize, prediction.wager))}
            </div>
          )}
        </div>
      </div>

      {!isEmpty(notifications) &&
        map(notifications, (notification, id) => (
          <PredictionNotification key={id} {...notification} />
        ))}
    </div>
  )
}

RoundActualPrediction.propTypes = {
  round: PropTypes.object.isRequired,
  prediction: PropTypes.object.isRequired,
}

export default connect((state, props) => {
  const notifications = getRelationNotifications(
    state,
    props.prediction.predictionid
  )
  const settlment = getSettlmentById(
    state,
    props.round?.pricefeed,
    props.round?.endDate
  )
  const latestPrice = getLatestPriceByPricefeed(state, props.round?.pricefeed)
  const propagating = isEntityPropagating(state, props.prediction.predictionid)
  const reverted = isEnityReverted(state, props.prediction.predictionid)
  const orphan = reverted && props.prediction.phantom

  return {
    notifications,
    orphan,
    propagating,

    settlment,
    latestPrice,
  }
})(React.memo(RoundActualPrediction))
