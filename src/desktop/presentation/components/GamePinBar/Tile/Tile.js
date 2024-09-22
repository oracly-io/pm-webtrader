import React, { useCallback } from 'react'
import PropTypes from 'prop-types'
import { isEmpty, map, orderBy, mapKeys } from 'lodash'
import cn from 'clsx'
import { futureProfitPercent } from '@oracly/pm-libs/calc-utils'
import { formatDistanceUnixTS, nowUnixTS } from '@oracly/pm-libs/date-utils'
import { htmlCurrency, htmlPercentSigned } from '@oracly/pm-libs/html-utils'

import { SET_ACTIVE_GAME, UNPIN_GAME } from '@actions'
import { READ_BLOCKCHAIN_ROUND_BY_ID } from '@actions'

import { PRIZEFUNDS } from '@constants'

import { useRenderAt, useScheduledQuery } from '@hooks'

import BidDownIcon from '@components/SVG/PredictionListBidDown'
import BidUpIcon from '@components/SVG/PredictionListBidUp'
import BidZeroIcon from '@components/SVG/PredictionListBidZero'
import Unpin from '@components/SVG/Unpin'
import { factoryByCurrency } from '@components/SVG/currency'

import AnimatedTimer from '@components/common/Timer/Animated'
import LevelCurrency from '@components/common/Currency/Level'

import { connect } from '@state'
import { getGameById, isActiveGame, getActualRound } from '@state/getters'
import { getLatestbcBlockNumber } from '@state/getters'

import css from './Tile.module.scss'

const ORDER = {
  [PRIZEFUNDS.UP]: 0,
  [PRIZEFUNDS.DOWN]: 1,
  [PRIZEFUNDS.EQUAL]: 2,
  [PRIZEFUNDS.TOTAL]: 3,
}

const Tile = (props) => {

  const game = props.game
  const gameid = props.gameid
  const round = props.round
  const roundid = round.roundid

  const locked = round?.lockDate <= nowUnixTS()
  useRenderAt(round?.lockDate)

  const setActive = useCallback(() => props.SET_ACTIVE_GAME({ gameid }), [gameid])
  const unpinGame = useCallback(e => e.stopPropagation() || props.UNPIN_GAME({ gameid }), [gameid])

  useScheduledQuery((query, state) => {
    const blockNumber = getLatestbcBlockNumber(state)
    if (roundid && blockNumber) query(READ_BLOCKCHAIN_ROUND_BY_ID, { roundid, txn: { blockNumber } }, { schedule: 5 })
  }, [roundid, gameid])

  // We should not render pined games until entity is loaded
  if (isEmpty(game)) return null

  const prizefund = round.prizefunds[PRIZEFUNDS.TOTAL]
  const profitPercents = futureProfitPercent(round.prizefunds, game.minWager)
  // hot-fix for ordering
  const ordered = orderBy(mapKeys(profitPercents, (pp, position) => ORDER[position]), (_, keys) => keys)

  const From = factoryByCurrency(game.base)

  return (
    <div
      className={cn(css.tile, {
        [css.selected]: props.isActive,
        [css.unlocked]: !locked
      })}
      onClick={setActive}
    >
      <div className={css.inner}>
        <div className={css.left}>

          <div className={css.flags}>
            <From />
          </div>

          <div className={css.event}>
            <div className={css.prize}>
              <div
                className={css.total}
                title={htmlCurrency(prizefund) + ' ' + game.currency}
              >
                {formatDistanceUnixTS(0, game.schedule - game.positioning)}
              </div>
            </div>
            <div className={css.name}>{game.name}</div>
          </div>

          <div className={css.profit}>
              {map(ordered, (pp, order) =>
                !!Number(pp) && order != ORDER[PRIZEFUNDS.TOTAL] &&
                <div className={css.percents} key={order}>
                  <div
                    className={css.percent}
                    title={htmlPercentSigned(Math.max(pp, 0))}
                  >
                    {order === ORDER[PRIZEFUNDS.UP] && <BidUpIcon/>}
                    {order === ORDER[PRIZEFUNDS.DOWN] && <BidDownIcon/>}
                    {order === ORDER[PRIZEFUNDS.EQUAL] && <BidZeroIcon/>}
                    {htmlPercentSigned(Math.max(pp, 0))}
                  </div>
                </div>
              )}
          </div>

        </div>
        <div className={css.right}>

          <div className={css.unpin} onClick={unpinGame}>
            <Unpin/>
          </div>

          <div className={css.pietimer}>
            <AnimatedTimer
              startUnixTS={round?.startDate}
              endUnixTS={round?.endDate}
              progressClass={css.tillpayoutprogress}
              radius="20"
            >
              {!locked &&
                <AnimatedTimer
                  startUnixTS={round.startDate}
                  endUnixTS={round.lockDate}
                  progressClass={css.timeprogress}
                  radius="15"
                >
                  <LevelCurrency
                    className={css.level}
                    currency={game.currency}
                    type={game.level}
                  />
                </AnimatedTimer>
              }
              {locked &&
                <div className={css.locktimer}>
                  <LevelCurrency
                    className={css.level}
                    currency={game.currency}
                    type={game.level}
                  />
                </div>
              }
            </AnimatedTimer>
          </div>

        </div>
      </div>
    </div>
  )

}

Tile.propTypes = {
  gameid: PropTypes.string.isRequired,
}

export default connect(
  (state, props) => {
    return {
      isActive: isActiveGame(state, props.gameid),
      game: getGameById(state, props.gameid),
      round: getActualRound(state, props.gameid),
    }
  },
  ({ command, query }, props) => ([
    command(UNPIN_GAME),
    command(SET_ACTIVE_GAME),
  ]),
)(React.memo(Tile))
