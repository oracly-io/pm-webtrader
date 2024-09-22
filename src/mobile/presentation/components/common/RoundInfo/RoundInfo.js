import React, { useRef } from 'react'
import PropTypes from 'prop-types'
import cn from 'clsx'
import { isEmpty } from 'lodash'

import { useScheduledQuery } from '@hooks'

import { useEffectState } from '@hooks'

import { connect } from '@state'
import { READ_BLOCKCHAIN_ROUND_BY_ID } from '@state/actions'
import {
  getActiveAccountAddress,
  getBettorRoundPredictions,
  getGameById,
} from '@state/getters'
import { getSettlmentById, getLatestPriceByPricefeed } from '@state/getters'
import { getLatestbcBlockNumber } from '@state/getters'
import { isEntityPropagating } from '@state/getters'

import { getRoundResolutionDynamic } from '@utils'

import css from './RoundInfo.module.scss'

const RoundInfo = (props) => {
  const game = props.game
  const round = props.round
  const propagating = props.propagating
  const settlment = props.settlment
  const bettorpredictions = props.bettorpredictions

  const ref = useRef()

  useEffectState(
    (state) => {
      const blockNumber = getLatestbcBlockNumber(state)
      if (blockNumber && round?.roundid) {
        props.READ_BLOCKCHAIN_ROUND_BY_ID({
          roundid: round.roundid,
          txn: { blockNumber },
        })
      }
    },
    [round?.roundid]
  )

  useScheduledQuery(
    (query, state) => {
      const blockNumber = getLatestbcBlockNumber(state)
      if (blockNumber && round?.roundid && round?.phantom) {
        query(
          READ_BLOCKCHAIN_ROUND_BY_ID,
          { roundid: round.roundid, txn: { blockNumber } },
          { schedule: 5 }
        )
      }
    },
    [round?.roundid]
  )

  if (isEmpty(round) || isEmpty(game)) return null

  const resolution = getRoundResolutionDynamic(
    round,
    props.latestPrice,
    props.settlment
  )
  const phantom = round.phantom

  return (
    <div
      ref={ref}
      className={cn(css.roundinfo, props.className, {
        propagating,
        phantom,
      })}
    >
      {props.children(
        { round, settlment, game, resolution, propagating, bettorpredictions },
        ref
      )}
    </div>
  )
}

RoundInfo.propTypes = {
  className: PropTypes.string,
  round: PropTypes.object.isRequired,
}

export default connect(
  (state, { round }) => {
    const bettorpredictions = getBettorRoundPredictions(
      state,
      round.roundid,
      getActiveAccountAddress(state)
    )

    const game = getGameById(state, round.gameid)
    const settlment = getSettlmentById(state, round.pricefeed, round.endDate)
    const latestPrice = getLatestPriceByPricefeed(state, round.pricefeed)

    const propagating = isEntityPropagating(state, round.roundid)

    return {
      game,
      settlment,
      latestPrice,

      propagating,

      bettorpredictions,
    }
  },
  ({ query }) => [query(READ_BLOCKCHAIN_ROUND_BY_ID)]
)(React.memo(RoundInfo))
