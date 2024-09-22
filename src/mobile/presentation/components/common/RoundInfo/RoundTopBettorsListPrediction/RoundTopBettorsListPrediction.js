import React from 'react'
import PropTypes from 'prop-types'
import { isEmpty } from 'lodash'
import cn from 'clsx'
import { actualReturn, profitPercent } from '@oracly/pm-libs/calc-utils'
import { htmlCurrency, htmlCurrencyNamed } from '@oracly/pm-libs/html-utils'
import { htmlAddressHref } from '@oracly/pm-libs/html-utils'
import { htmlPercent } from '@oracly/pm-libs/html-utils'

import { DOWN, UP, EQUAL, NOCONTEST } from '@constants'

import { useTranslate } from '@lib/i18n-utils'

import OpenInNewTab from '@components/SVG/OpenInNewTab'

import WageredDownIcon from '@components/SVG/WageredDownIcon'
import WageredUpIcon from '@components/SVG/WageredUpIcon'
import WageredZeroIcon from '@components/SVG/WageredZeroIcon'

import LevelCurrency from '@components/common/Currency/Level'
import Avatar from '@components/common/Avatar'
import Nickname from '@components/common/Nickname'

import css from './RoundTopBettorsListPrediction.module.scss'

const RoundTopBettorsListPrediction = (props) => {
  const t = useTranslate()

  const round = props.round
  const prediction = props.prediction
  const game = props.game
  const className = props.className

  let prize = 0
  if (round.resolved) {
    if (prediction.claimed) {
      prize = prediction.payout
    } else if (round.resolution === NOCONTEST) {
      prize = prediction.wager
    } else if (round.resolution === prediction.position) {
      prize = actualReturn(
        round.prizefunds,
        prediction.wager,
        prediction.position
      )
    }
  }

  if (isEmpty(round)) return null
  if (isEmpty(prediction)) return null

  const predictionPositions = {
    [UP]: t('Up'),
    [DOWN]: t('Down'),
    [EQUAL]: t('Zero'),
  }

  return (
    <div className={cn(css.bettor, className)}>
      <div className={css.name}>
        <Avatar address={prediction.bettor} className={css.avatar} />
        <div className={css.nickname} title={prediction.bettor}>
          <a
            className={css.link}
            href={htmlAddressHref(prediction.bettor)}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Nickname address={prediction.bettor} />
            <OpenInNewTab />
          </a>
        </div>
      </div>
      <div className={css.wager}>
        <div
          className={css.position}
          title={[
            predictionPositions[prediction.position],
            htmlCurrencyNamed(prediction.wager, round.currency),
          ].join(' ')}
        >
          {prediction.position === UP && <WageredUpIcon />}
          {prediction.position === DOWN && <WageredDownIcon />}
          {prediction.position === EQUAL && <WageredZeroIcon />}
        </div>
        {!round.resolved && (
          <div
            className={css.amount}
            title={htmlCurrencyNamed(prediction.wager, round.currency)}
          >
            <span>{htmlCurrency(prediction.wager)}</span>
            <LevelCurrency
              className={css.level}
              currency={round.currency}
              type={game.level}
            />
          </div>
        )}
        {round.resolved && (
          <div
            title={htmlCurrencyNamed(prize, round.currency)}
            className={cn(css.payout, { [css.payment]: !!prize })}
          >
            {!!prize && prize !== prediction.wager && (
              <div className={css.percentage}>
                {htmlPercent(profitPercent(prize, prediction.wager))}
              </div>
            )}
            <span>{htmlCurrency(prize)}</span>
            <LevelCurrency
              className={css.level}
              currency={round.currency}
              type={game.level}
            />
          </div>
        )}
      </div>
    </div>
  )
}

RoundTopBettorsListPrediction.propTypes = {
  className: PropTypes.string,
  prediction: PropTypes.object.isRequired,
  round: PropTypes.object.isRequired,
  game: PropTypes.object.isRequired,
}

export default React.memo(RoundTopBettorsListPrediction)
