import React from 'react'
import PropTypes from 'prop-types'
import cn from 'clsx'
import { actualReturn, profitPercent } from '@oracly/pm-libs/calc-utils'
import { htmlCurrency, htmlCurrencyNamed } from '@oracly/pm-libs/html-utils'
import { htmlPercentSigned } from '@oracly/pm-libs/html-utils'

import { DOWN, UP, EQUAL, NOCONTEST, UNDEFINED } from '@constants'

import WageredDownIcon from '@components/SVG/WageredDownIcon'
import WageredUpIcon from '@components/SVG/WageredUpIcon'
import WageredZeroIcon from '@components/SVG/WageredZeroIcon'
import LevelCurrency from '@components/common/Currency/Level'
import Coin from '@components/common/Coin'
import PredictionLostIcon from '@components/SVG/PredictionLostIcon'
import PredictionNoContestIcon from '@components/SVG/PredictionNoContestIcon'
import PredictionWinIcon from '@components/SVG/PredictionWinIcon'
import ClaimButton from '@components/common/ClaimButton'

import { useTranslate } from '@lib/i18n-utils'

import { connect } from '@state'
import { getLatestPriceByPricefeed, getSettlmentById } from '@state/getters'
import { isEnityReverted, isEntityPropagating } from '@state/getters'
import { isNoContestEmptyRound, getRoundResolutionDynamic } from '@utils'
import { isHistoricalRound } from '@utils'

import css from './RoundHistoricalPrediction.module.scss'

const RoundHistoricalPrediction = props => {

  const t = useTranslate()

  const game = props.game
  const round = props.round
  const prediction = props.prediction

  const orphan = props.orphan
  const propagating = props.propagating

  if (orphan) return null

  const emptyround = isNoContestEmptyRound(round)
  const resolution = getRoundResolutionDynamic(round, props.latestPrice, props.settlment)
  const phantom = prediction.phantom
  const undef = resolution === UNDEFINED
  const nocontest = resolution === NOCONTEST && !phantom
  const win = prediction.position === resolution && !phantom
  const lose = !win && !phantom
  const isHistorical = isHistoricalRound(round, props.settlment) && !phantom

  const won = win && isHistorical && !nocontest && !phantom
  const lost = lose && isHistorical && !nocontest && !phantom
  const claimed = prediction.claimed
  const claimable = (won || nocontest) && !claimed

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
    prize = actualReturn(round.prizefunds, prediction.wager, prediction.position)
  }

  const awarded = !!prize && prize !== prediction.wager

  return (
    <div className={cn(css.container, {
      [css.win]: win && awarded,
      [css.claimable]: claimable,
      [css.nocontest]: nocontest,

      propagating,
    })}>

      <div className={css.info}>
        <div className={css.wager}>
          <span className={css.position}
            title={[predictionPositions[prediction.position], htmlCurrencyNamed(prediction.wager, game.currency)].join(' ')}
          >
            {prediction.position === UP && <WageredUpIcon />}
            {prediction.position === DOWN && <WageredDownIcon />}
            {prediction.position === EQUAL && <WageredZeroIcon />}
          </span>
          <span className={css.value}>
            {htmlCurrency(prediction.wager)}
          </span>
          <LevelCurrency
            className={css.level}
            currency={game.currency}
            type={game.level}
          />
        </div>

        <div className={css.stateIcon}>
          {(won && claimed) && <PredictionWinIcon />}
          {(won && claimable) && <Coin type="gold" currency={game.currency} animate />}

          {(nocontest && claimed) && <PredictionNoContestIcon />}
          {(nocontest && claimable) && <Coin type="silver" currency={game.currency} animate />}

          {lost && <PredictionLostIcon />}
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

      {claimable && (
        <ClaimButton
          prediction={prediction}
          round={round}
          prize={prize}
          settlment={props.settlment}
          nocontest={nocontest}
        />
      )}

    </div>
  )
}

RoundHistoricalPrediction.propTypes = {
  round: PropTypes.object.isRequired,
  prediction: PropTypes.object.isRequired,
}

export default connect(
  (state, props) => {
    const settlment = getSettlmentById(state, props.round?.pricefeed, props.round?.endDate)
    const latestPrice = getLatestPriceByPricefeed(state, props.round?.pricefeed)
    const propagating = isEntityPropagating(state, props.prediction.predictionid)
    const reverted = isEnityReverted(state, props.prediction.predictionid)
    const orphan = reverted && props.prediction.phantom

    return {
      orphan,
      propagating,

      settlment,
      latestPrice,
    }
  }
)(React.memo(RoundHistoricalPrediction))
