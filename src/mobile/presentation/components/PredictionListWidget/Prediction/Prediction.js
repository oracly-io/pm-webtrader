import React, { useCallback, useEffect } from 'react'
import PropTypes from 'prop-types'
import cn from 'clsx'
import { isEmpty } from 'lodash'
import { actualReturn, profitPercent } from '@oracly/pm-libs/calc-utils'
import {
  formatDistanceUnixTS,
  formatUnixTS,
  nowUnixTS,
  toLocalStringUnixTS,
} from '@oracly/pm-libs/date-utils'
import {
  htmlPercentSigned,
  htmlCurrency,
  htmlCurrencyNamed,
} from '@oracly/pm-libs/html-utils'

import { SET_ACTIVE_GAME, FOCUS_ROUND } from '@actions'
import { READ_BLOCKCHAIN_ROUND_BY_ID } from '@actions'

import {
  DOWN,
  UP,
  EQUAL,
  NOCONTEST,
  UNDEFINED,
  PRICEFEED,
} from '@constants'

import { useRenderAt } from '@hooks'

import Countdown from '@components/common/Timer/Countdown'
import LevelCurrency from '@components/common/Currency/Level'
import AnimatedTimer from '@components/common/Timer/Animated'
import Coin from '@components/common/Coin'
import ClaimButton from '@components/common/ClaimButton'

import WageredDownIcon from '@components/SVG/WageredDownIcon'
import WageredUpIcon from '@components/SVG/WageredUpIcon'
import WageredZeroIcon from '@components/SVG/WageredZeroIcon'
import OpenInNewTab from '@components/SVG/OpenInNewTab'
import RefreshTimerWhiteIcon from '@components/SVG/RoundTrackTileRefreshTimer.White'
import LockTimerIcon from '@components/SVG/RoundTrackTileLockTimer.White'
import PredictionLostIcon from '@components/SVG/PredictionLostIcon'
import PredictionNoContestIcon from '@components/SVG/PredictionNoContestIcon'
import PredictionWinIcon from '@components/SVG/PredictionWinIcon'

import { factoryByCurrency } from '@components/SVG/currency'

import { connect } from '@state'
import {
  getGameById,
  getPredictionById,
  getRoundByPredictionId,
} from '@state/getters'
import { getSettlmentById, getLatestPriceByPricefeed } from '@state/getters'
import {
  isEntityPropagating,
  isEnityVerified,
  isEnityReverted,
} from '@state/getters'
import { getLatestbcBlockNumber } from '@state/getters'

import {
  getRoundResolutionDynamic,
  isHistoricalRound,
  isNoContestEmptyRound,
} from '@utils'

import css from './Prediction.module.scss'

const Prediction = (props) => {
  const blockNumber = props.blockNumber

  const game = props.game
  const round = props.round
  const prediction = props.prediction

  const emptyround = isNoContestEmptyRound(round)

  const expired = round?.expirationDate <= nowUnixTS()
  useRenderAt(round?.expirationDate)

  const locked = round?.lockDate <= nowUnixTS()
  useRenderAt(round?.lockDate)

  const isActual = round?.endDate > nowUnixTS()
  useRenderAt(round?.endDate)

  const activate = useCallback(
    (e) => {
      e.stopPropagation()
      const gameid = round?.gameid
      if (gameid) props.SET_ACTIVE_GAME({ gameid })
    },
    [round?.gameid]
  )

  const showround = useCallback(() => {
    const roundid = round?.roundid
    if (roundid) props.FOCUS_ROUND({ roundid })
  }, [round?.roundid])

  useEffect(() => {
    if (isEmpty(round) && !isEmpty(prediction) && blockNumber) {
      props.READ_BLOCKCHAIN_ROUND_BY_ID({
        roundid: prediction.roundid,
        txn: { blockNumber },
      })
    }
  }, [prediction, round, !!blockNumber])

  if (isEmpty(game) || isEmpty(round) || isEmpty(prediction)) {
    // Fix react-virtuoso: Zero-sized element warning
    return <div style={{ height: '1px' }} />
  }

  const propagating = props.propagating
  const verified = props.verified

  const resolution = getRoundResolutionDynamic(
    round,
    props.latestPrice,
    props.settlment
  )
  const phantom = prediction.phantom
  const undef = resolution === UNDEFINED
  const nocontest = resolution === NOCONTEST && !phantom
  const win = prediction.position === resolution && !phantom
  const lose = !win && !phantom

  const isHistorical = isHistoricalRound(round, props.settlment)

  const orphan = props.orphan || (isHistorical && phantom && !propagating)
  const winning = win && !isHistorical && !phantom
  const loseing = lose && !isHistorical && !phantom
  const won = win && isHistorical && !nocontest && !phantom
  const lost = lose && isHistorical && !nocontest && !phantom
  const claimed = prediction.claimed
  const claimable = (won || nocontest) && !claimed

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

  const From = factoryByCurrency(game.base)

  const awarded = !!prize && prize !== prediction.wager

  const className = cn(css.prediction, {
    [css.verified]: verified,
    [css.orphan]: orphan,
    [css.undef]: undef,
    [css.phantom]: phantom,
    [css.winning]: winning && awarded,
    [css.loseing]: loseing,
    [css.locked]: locked,
    [css.won]: won && awarded,
    [css.lost]: lost,
    [css.nocontest]: nocontest,
    [css.claimed]: claimed,
    [css.claimable]: claimable,
    [css.historical]: isHistorical,
    [css.expired]: expired,

    propagating,
  })

  return (
    <div
      title={'ID:' + props.predictionid}
      onClick={showround}
      className={className}
    >
      <div className={css.top}>
        <div onClick={activate} className={css.event}>
          <div className={css.flags}>
            <From />
          </div>
          <div className={css.description}>
            <div className={css.schedule}>
              {formatDistanceUnixTS(0, game.schedule - game.positioning)}
            </div>
            <div className={css.name}>
              <a
                className={cn(css.icon, css.link)}
                href={PRICEFEED.CL_URL[props.game.pricefeed]}
                target="_blank"
                rel="noopener noreferrer"
                title={props.game.pricefeed}
              >
                <span>{props.game.name}</span>
                <OpenInNewTab />
              </a>
            </div>
          </div>
        </div>

        <div className={css.time}>
          {isActual && !orphan && !expired && (
            <>
              <Countdown unixTS={round.endDate} />
              <div className={css.pietimer}>
                <AnimatedTimer
                  startUnixTS={round.startDate}
                  endUnixTS={round.endDate}
                  progressClass={css.tillpayoutprogress}
                  radius="20"
                >
                  {!locked && (
                    <AnimatedTimer
                      startUnixTS={round.startDate}
                      endUnixTS={round.lockDate}
                      progressClass={css.timeprogress}
                      radius="15"
                    >
                      <RefreshTimerWhiteIcon />
                    </AnimatedTimer>
                  )}
                  {locked && <LockTimerIcon />}
                </AnimatedTimer>
              </div>
            </>
          )}
          {!isActual && (
            <span title={toLocalStringUnixTS(props.prediction.createdAt)}>
              {formatUnixTS(props.prediction.createdAt, 'p')}
            </span>
          )}
        </div>
      </div>

      <div className={css.divider} />

      <div className={css.bottom}>
        <div className={css.info}>
          <div className={css.wager}>
            <span className={css.position}>
              {prediction.position === UP && <WageredUpIcon />}
              {prediction.position === DOWN && <WageredDownIcon />}
              {prediction.position === EQUAL && <WageredZeroIcon />}
            </span>
            <div className={css.value}>{htmlCurrency(prediction.wager)}</div>
            <LevelCurrency
              className={css.currency}
              currency={game.currency}
              type={game.level}
            />
          </div>

          <div className={css.stateIcon}>
            {won && claimed && <PredictionWinIcon />}
            {won && claimable && (
              <Coin type="gold" currency={game.currency} animate />
            )}

            {nocontest && claimed && <PredictionNoContestIcon />}
            {nocontest && claimable && (
              <Coin type="silver" currency={game.currency} animate />
            )}

            {lost && <PredictionLostIcon />}
          </div>

          <div
            title={htmlCurrencyNamed(prize, round.currency)}
            className={cn(css.payout, {
              [css.payment]: !!prize,
              [css.hidden]: undef || phantom,
            })}
          >
            {awarded && (
              <div className={css.percentage}>
                {htmlPercentSigned(profitPercent(prize, prediction.wager))}
              </div>
            )}
            <span>{htmlCurrency(prize)}</span>
            <LevelCurrency currency={game.currency} type={game.level} />
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
    </div>
  )
}

Prediction.propTypes = {
  predictionid: PropTypes.string.isRequired,
}

export default connect(
  (state, { predictionid }) => {
    const prediction = getPredictionById(state, predictionid)

    // NOTE: it's important to use getRoundByPredictionId funciton
    // it's able to return actual round if nessesery
    const round = getRoundByPredictionId(state, predictionid)
    const game = getGameById(state, prediction.gameid)
    const settlment = getSettlmentById(state, round?.pricefeed, round?.endDate)
    const latestPrice = getLatestPriceByPricefeed(state, round?.pricefeed)

    const propagating = isEntityPropagating(state, predictionid)
    const verified = isEnityVerified(state, predictionid)
    const reverted = isEnityReverted(state, predictionid)
    const orphan = reverted && prediction.phantom

    const blockNumber = getLatestbcBlockNumber(state)

    return {
      predictionid,
      prediction,
      round,
      game,
      settlment,
      latestPrice,
      blockNumber,

      verified,
      propagating,
      orphan,
    }
  },
  ({ command, query }) => [
    query(READ_BLOCKCHAIN_ROUND_BY_ID),

    command(FOCUS_ROUND),
    command(SET_ACTIVE_GAME),
  ]
)(React.memo(Prediction))
