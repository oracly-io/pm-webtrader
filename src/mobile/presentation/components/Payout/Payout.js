import React from 'react'
import cn from 'clsx'
import AnimatedButton from '@oracly/pm-react-components/app/mobile/components/common/AnimatedButton'

import Coin from '@components/common/Coin'
import { useWithdraw } from '@components/common/ClaimButton/useWithdraw'
import { connect } from '@state'
import {
  WITHDRAW,
  RESOLVE_WITHDRAW,
  RESOLVE_WITHDRAW_NOCONTEST,
} from '@state/actions'
import {
  getLastClaimablePrediction,
  getRoundByPredictionId,
  isLoading,
} from '@state/getters'
import {
  getSettlmentById,
  isEntityPropagating,
} from '@state/getters'
import { htmlCurrency, htmlCurrencyNamed } from '@oracly/pm-libs/html-utils'

import css from './Payout.module.scss'

const Payout = (props) => {
  const { round, prediction, settlment, type, prize, confirming, propagating } = props

  const withdraw = useWithdraw(props, {
    disabled: confirming || propagating,
    round,
    prediction,
    settlment,
  })

  if (!round) return null
  if (!prediction) return null
  if (!type) return null

  return (
    <AnimatedButton
      className={cn(css.animatedBtn, props.className)}
      onClick={withdraw}
      hoverBorderOpacity={0.43}
      activeBorderCircle={0.62}
      disabled={confirming || propagating}
    >
      <div
        className={cn(css.container, {
          [css.gold]: type === 'gold',
          [css.silver]: type === 'silver',

          propagating: confirming || propagating,
        })}
      >
        <div className={css.gradient} />
        <div
          className={css.content}
          title={htmlCurrencyNamed(prize, round.currency)}
        >
          <Coin
            className={cn(css.coin, {
              [css.gold]: type === 'gold',
              [css.silver]: type === 'silver',
            })}
            type={type}
            currency={round.currency}
          />
          <span className={css.amount}>+{htmlCurrency(prize)}</span>
        </div>
      </div>
    </AnimatedButton>
  )
}

export default connect(
  (state) => {
    const { prediction, won, nocontest, prize } = getLastClaimablePrediction(state)
    const round = getRoundByPredictionId(state, prediction?.predictionid)
    const settlment = getSettlmentById(state, round?.pricefeed, round?.endDate)
    const propagating = isEntityPropagating(state, prediction?.predictionid)
    const confirming = (
      isLoading(state, WITHDRAW, prediction?.predictionid) ||
      isLoading(state, RESOLVE_WITHDRAW, prediction?.predictionid) ||
      isLoading(state, RESOLVE_WITHDRAW_NOCONTEST, prediction?.predictionid)
    )

    let type
    if (nocontest) type = 'silver'
    if (won) type = 'gold'

    return {
      prediction,
      round,
      settlment,
      type,
      prize,
      confirming,
      propagating,
    }
  },
  ({ query }) => [
    // NOTE: It's important to use 'query' here in order to block interaction
    // until first action get resolved, in case confirming veriable will be set wronge
    query(WITHDRAW),
    query(RESOLVE_WITHDRAW),
    query(RESOLVE_WITHDRAW_NOCONTEST),
  ]
)(React.memo(Payout))
