import React, { useCallback } from 'react'
import PropTypes from 'prop-types'
import { isEmpty } from 'lodash'
import cn from 'clsx'
import { nowUnixTS } from '@oracly/pm-libs/date-utils'

import { SET_ACTIVE_GAME } from '@actions'
import { READ_BLOCKCHAIN_ROUND_BY_ID } from '@actions'

import { useRenderAt, useScheduledQuery } from '@hooks'


import AnimatedTimer from '@components/common/Timer/Animated'
import LevelTag from '@components/common/LevelTag'

import { connect } from '@state'
import { getGameById, isActiveGame, getActualRound } from '@state/getters'
import { getLatestbcBlockNumber } from '@state/getters'

import Coin from '../Coin'
import css from './Tile.module.scss'

const Tile = (props) => {
  const game = props.game
  const gameid = props.gameid
  const round = props.round
  const roundid = round.roundid

  const locked = round?.lockDate <= nowUnixTS()
  useRenderAt(round?.lockDate)

  const setActive = useCallback(
    () => props.SET_ACTIVE_GAME({ gameid }),
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

  return (
    <div
      className={cn(css.tile, {
        [css.selected]: props.isActive,
        [css.unlocked]: !locked,
      })}
      onClick={setActive}
    >
      <div className={css.right}>
        <LevelTag game={props.game} className={css.level} short />
        <div className={css.pietimer}>
          <AnimatedTimer
            startUnixTS={round?.startDate}
            endUnixTS={round?.endDate}
            progressClass={css.tillpayoutprogress}
            radius="24"
          >
            {!locked && (
              <AnimatedTimer
                startUnixTS={round.startDate}
                endUnixTS={round.lockDate}
                progressClass={css.timeprogress}
                radius="19"
              >
                <Coin game={game}/>
              </AnimatedTimer>
            )}
            {locked && (
              <div className={css.locktimer}>
                <Coin game={game}/>
              </div>
            )}
          </AnimatedTimer>
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
  ({ command, query }, props) => [
    command(SET_ACTIVE_GAME),

    query(READ_BLOCKCHAIN_ROUND_BY_ID),
  ]
)(React.memo(Tile))
