import React, { useCallback, useEffect, useState } from 'react'
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

import LevelTag from '@components/common/LevelTag'
import BidDownIcon from '@components/SVG/PredictionListBidDown'
import BidUpIcon from '@components/SVG/PredictionListBidUp'
import BidZeroIcon from '@components/SVG/PredictionListBidZero'
import Unpin from '@components/SVG/Unpin'

import { connect } from '@state'
import { getGameById, isActiveGame, getActualRound } from '@state/getters'
import { getLatestbcBlockNumber } from '@state/getters'

import Coin from '../Coin'
import css from './ActiveTile.module.scss'

const ORDER = {
  [PRIZEFUNDS.UP]: 0,
  [PRIZEFUNDS.DOWN]: 1,
  [PRIZEFUNDS.EQUAL]: 2,
  [PRIZEFUNDS.TOTAL]: 3,
}

const ActiveTile = (props) => {
  const [transitioning, setTransitioning] = useState(false)

  useEffect(() => {
    setTransitioning(true)
    setTimeout(() => {
      setTransitioning(false)
    }, 500)
  }, [props.gameid])

  const game = props.game
  const gameid = props.gameid
  const nextGameId = props.nextGameId

  const round = props.round
  const roundid = round.roundid

  const locked = round?.lockDate <= nowUnixTS()
  useRenderAt(round?.lockDate)

  const unpinGame = useCallback(
    (e) => {
      e.stopPropagation()
      props.SET_ACTIVE_GAME({ gameid: nextGameId })
      props.UNPIN_GAME({ gameid })
    },
    [gameid]
  )

  useScheduledQuery(
    (query, state) => {
      const blockNumber = getLatestbcBlockNumber(state)
      if (roundid && blockNumber)
        query(
          READ_BLOCKCHAIN_ROUND_BY_ID,
          { roundid, txn: { blockNumber } },
          { schedule: 5 }
        )
    },
    [roundid, gameid]
  )

  // We should not render pined games until entity is loaded
  if (isEmpty(game)) return null

  const prizefund = round.prizefunds[PRIZEFUNDS.TOTAL]
  const profitPercents = futureProfitPercent(round.prizefunds, game.minWager)
  // hot-fix for ordering
  const ordered = orderBy(
    mapKeys(profitPercents, (pp, position) => ORDER[position]),
    (_, keys) => keys
  )

  return (
    <div
      className={cn(css.activeTile, {
        [css.selected]: props.isActive,
        [css.unlocked]: !locked,
      })}
    >
      <div
        className={cn(css.inner, {
          [css.transitioning]: transitioning,
        })}
      >
        <div className={css.left}>
          <div className={css.coinContainer}>
            <LevelTag game={game} className={css.level} short />
            <Coin game={game} className={css.coin} />
          </div>

          <div className={css.event}>
            <div className={css.prize}>
              <div
                className={css.total}
                title={htmlCurrency(prizefund) + ' ' + game.currency}
              >
                {formatDistanceUnixTS(0, game.schedule - game.positioning, {
                  short: true,
                })}
              </div>
            </div>
            <div className={css.name}>{game.name}</div>
          </div>

          <div className={css.profit}>
            {map(
              ordered,
              (pp, order) =>
                !!Number(pp) &&
                order != ORDER[PRIZEFUNDS.TOTAL] && (
                  <div className={css.percents} key={order}>
                    <div
                      className={css.percent}
                      title={htmlPercentSigned(Math.max(pp, 0))}
                    >
                      {order === ORDER[PRIZEFUNDS.UP] && <BidUpIcon />}
                      {order === ORDER[PRIZEFUNDS.DOWN] && <BidDownIcon />}
                      {order === ORDER[PRIZEFUNDS.EQUAL] && <BidZeroIcon />}
                      {htmlPercentSigned(Math.max(pp, 0))}
                    </div>
                  </div>
                )
            )}
          </div>
        </div>
        <div className={css.right}>
          <div
            className={cn(css.unpin, {
              [css.hidden]: !nextGameId,
            })}
            onClick={unpinGame}
          >
            <Unpin />
          </div>
        </div>
      </div>
    </div>
  )
}

ActiveTile.propTypes = {
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
  ({ command, query }, props) => [
    command(UNPIN_GAME),
    command(SET_ACTIVE_GAME),

    query(READ_BLOCKCHAIN_ROUND_BY_ID),
  ]
)(React.memo(ActiveTile))
