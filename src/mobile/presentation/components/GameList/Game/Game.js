import React, { useCallback } from 'react'
import PropTypes from 'prop-types'
import cn from 'clsx'
import { startsWith, isEmpty, toUpper, reduce } from 'lodash'
import { futureProfitPercent, gt } from '@oracly/pm-libs/calc-utils'
import { formatDistanceUnixTS, nowUnixTS } from '@oracly/pm-libs/date-utils'
import { htmlAmount, htmlPercentSigned } from '@oracly/pm-libs/html-utils'

import { PRIZEFUNDS } from '@constants'
import { connect } from '@state'
import {
  getGameById,
  isPinedGame,
  isActiveGame,
  getActualRound,
} from '@state/getters'

import { PIN_GAME, SET_ACTIVE_GAME } from '@state/actions'

import AnimatedTimer from '@components/common/Timer/Animated'
import CountdownTimer from '@components/common/Timer/Countdown'
import BetTimer from '@components/SVG/BetTimer'
import LockTimerIcon from '@components/SVG/RoundTrackTileLockTimer.White'
import BidDownIcon from '@components/SVG/PredictionListBidDown'
import BidUpIcon from '@components/SVG/PredictionListBidUp'
import BidZeroIcon from '@components/SVG/PredictionListBidZero'
import RoundWidgetBettor from '@components/SVG/RoundWidgetBettor'
import LevelCurrency from '@components/common/Currency/Level'

import { factoryByCurrency } from '@components/SVG/currency'

import { useRenderAt } from '@hooks'

import css from './Game.module.scss'

const Game = (props) => {
  const game = props.game
  const gameid = props.gameid
  const actualround = props.actualround

  useRenderAt(lockDate)
  useRenderAt(endDate)

  const onClick = useCallback(() => {
    if (props.isPined && !props.isActive) props.SET_ACTIVE_GAME({ gameid })
    if (!props.isPined) props.PIN_GAME({ gameid })
    if (props.onClick) props.onClick()
  }, [props.isPined, props.isActive, gameid])

  if (!isEmpty(props.search) && !startsWith(game.name, toUpper(props.search)))
    return null

  if (!props.game) return null

  const now = nowUnixTS()
  const sinceStart = now % game.schedule
  const startDate = now - sinceStart
  const endDate = startDate + game.schedule
  const lockDate = startDate + game.positioning
  const locked = lockDate <= now

  const From = factoryByCurrency(game.base)

  const profitPercents = futureProfitPercent(
    actualround.prizefunds,
    game.minWager
  )

  const [maxProfitPosition, maxProfitPercents] = reduce(
    profitPercents,
    (acc, percents, position) => {
      if (
        position in [PRIZEFUNDS.UP, PRIZEFUNDS.DOWN, PRIZEFUNDS.EQUAL] &&
        !!Number(actualround.prizefunds[position]) &&
        (gt(percents, acc[1]) || !acc[1])
      )
        return [position, percents]

      return acc
    },
    []
  )

  return (
    <div className={css.container}>
      <div
        className={cn(css.game, {
          [css.unlocked]: !locked,
          [css.pined]: props.isPined,
          [css.selected]: props.isActive,
        })}
        onClick={onClick}
      >
        <div className={css.inner}>
          <div className={css.left}>
            <div className={css.flags}>
              <From />
            </div>

            <div className={css.event}>
              <div className={css.top}>
                <div className={css.time}>
                  {formatDistanceUnixTS(0, game.schedule - game.positioning)}
                </div>
                {maxProfitPosition && maxProfitPercents && (
                  <div className={css.profit}>
                    {Number(maxProfitPosition) === PRIZEFUNDS.UP && (
                      <BidUpIcon />
                    )}
                    {Number(maxProfitPosition) === PRIZEFUNDS.DOWN && (
                      <BidDownIcon />
                    )}
                    {Number(maxProfitPosition) === PRIZEFUNDS.EQUAL && (
                      <BidZeroIcon />
                    )}
                    <div className={css.percent}>
                      {htmlPercentSigned(Math.max(maxProfitPercents, 0))}
                    </div>
                  </div>
                )}
              </div>
              <div className={css.name}>{game.name}</div>
            </div>
          </div>
          <div className={css.right}>
            {!!Number(actualround.prizefunds[PRIZEFUNDS.TOTAL]) && (
              <div className={css.bank}>
                <div className={css.amount}>
                  {htmlAmount(actualround.bettors)}
                </div>
                <div className={css.icon}>
                  <RoundWidgetBettor />
                </div>
              </div>
            )}

            <div className={css.roundwrapper}>
              <div className={css.round}>
                <div className={css.tillpayout}>
                  <CountdownTimer unixTS={!locked ? lockDate : endDate} />
                </div>
                <div className={css.icon}>
                  {!locked && <BetTimer />}
                  {locked && <LockTimerIcon />}
                </div>
              </div>
            </div>

            <div className={css.pietimer}>
              <AnimatedTimer
                startUnixTS={startDate}
                endUnixTS={endDate}
                progressClass={css.tillpayoutprogress}
                radius="20"
              >
                {!locked && (
                  <AnimatedTimer
                    startUnixTS={startDate}
                    endUnixTS={lockDate}
                    progressClass={css.timeprogress}
                    radius="15"
                  >
                    <LevelCurrency
                      className={css.level}
                      currency={game.currency}
                      type={game.level}
                    />
                  </AnimatedTimer>
                )}

                {locked && (
                  <div className={css.locktimer}>
                    <LevelCurrency
                      className={css.level}
                      currency={game.currency}
                      type={game.level}
                    />
                  </div>
                )}
              </AnimatedTimer>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

Game.propTypes = {
  gameid: PropTypes.string.isRequired,
  onClick: PropTypes.func,
}

export default connect(
  (state, props) => {
    return {
      game: getGameById(state, props.gameid),
      actualround: getActualRound(state, props.gameid),
      isPined: isPinedGame(state, props.gameid),
      isActive: isActiveGame(state, props.gameid),
    }
  },
  ({ command }) => [command(PIN_GAME), command(SET_ACTIVE_GAME)]
)(React.memo(Game))
