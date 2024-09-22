import React from 'react'
import PropTypes from 'prop-types'
import cn from 'clsx'
import AnimatedButton from '@oracly/pm-react-components/app/desktop/components/common/AnimatedButton'
import { htmlCurrencyNamed } from '@oracly/pm-libs/html-utils'

import ClaimFragment from '@components/SVG/ClaimFragment'

import { useTranslate } from '@lib/i18n-utils'

import { connect } from '@state'
import { WITHDRAW, RESOLVE_WITHDRAW, RESOLVE_WITHDRAW_NOCONTEST } from '@state/actions'
import { isEntityPropagating, isLoading } from '@state/getters'

import { useWithdraw } from './useWithdraw'

import css from './ClaimButton.module.scss'

const ClaimButton = props => {

  const className = props.className
  const round = props.round
  const prediction = props.prediction
  const prize = props.prize
  const settlment = props.settlment
  const nocontest = props.nocontest
  const confirming = props.confirming
  const propagating = props.propagating

  const t = useTranslate()

  const withdraw = useWithdraw(props, {
    disabled: confirming || propagating,
    round,
    prediction,
    settlment,
  })

  return (
    <AnimatedButton
      className={cn(css.btn, className, {
        [css.claim]: !nocontest,
        [css.return]: nocontest,
        [css.confirming]: confirming,
        [css.propagating]: propagating,

        propagating: confirming || propagating,
      })}
      onClick={withdraw}
      hoverCircleOpacity={0.12}
      hoverBorderOpacity={0.43}
      activeInnerCircle={0.22}
      activeBorderCircle={0.62}
      title={confirming
        ? t('Awaiting Confirmation')
        : t('Withdraw {{prize}}', { prize: htmlCurrencyNamed(prize, round.currency) })
      }
    >
      <span className={css.fragment}>
        <ClaimFragment />
      </span>
      <span className={css.text}>{t('Withdraw')}</span>
    </AnimatedButton>
  )
}

ClaimButton.propTypes = {
  className: PropTypes.string,
  prediction: PropTypes.object,
  round: PropTypes.object,
  prize: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]).isRequired,
  settlment: PropTypes.object,
  nocontest: PropTypes.bool,
}

export default connect(
  (state, props) => ({
    confirming:
      isLoading(state, WITHDRAW, props.prediction.predictionid) ||
      isLoading(state, RESOLVE_WITHDRAW, props.prediction.predictionid) ||
      isLoading(state, RESOLVE_WITHDRAW_NOCONTEST, props.prediction.predictionid),
    propagating: isEntityPropagating(state, props.prediction.predictionid),
  }),
  ({ query }) => ([
    // NOTE: It's important to use 'query' here in order to block interaction
    // until first action get resolved, in case confirming veriable will be set wronge
    query(WITHDRAW),
    query(RESOLVE_WITHDRAW),
    query(RESOLVE_WITHDRAW_NOCONTEST),
  ])
)(React.memo(ClaimButton))
