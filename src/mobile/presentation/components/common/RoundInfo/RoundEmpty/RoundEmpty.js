import React from 'react'
import PropTypes from 'prop-types'
import { isEmpty, pickBy } from 'lodash'
import { nowUnixTS } from '@oracly/pm-libs/date-utils'

import WaitingCat from '@components/SVG/WaitingCat'
import { connect } from '@state'
import { getRoundTopWinnerPredictions, getRoundTopBettorPredictions } from '@state/getters'
import { getActiveAccountAddress, getBettorRoundPredictions } from '@state/getters'

import { useTranslate } from '@lib/i18n-utils'
import { useRenderAt } from '@hooks'
import { isRoundResolvedWithContest } from '@utils'

import css from './RoundEmpty.module.scss'

const getlist = (round, bettors, winners) => {
  let predictions = bettors
  if (isRoundResolvedWithContest(round)) {
    if (isEmpty(winners)) predictions = pickBy(bettors, { position: round.resolution })
    else predictions = winners
  }

  return predictions
}

const RoundEmpty = (props) => {
  const t = useTranslate()

  const round = props.round
  const winners = props.winners
  const bettors = props.bettors
  const bettorpredictions = props.bettorpredictions

  useRenderAt(round.lockDate)

  const predictions = getlist(round, bettors, winners)
  if (!isEmpty(predictions) || !isEmpty(bettorpredictions)) return null

  const locked = round.lockDate <= nowUnixTS()

  return (
    <div className={css.emptyround}>
      <div>
        <WaitingCat />
        <h4>{t('This Round is Empty')}</h4>
        {!locked &&
          <p>{t('Place Prediction first in order to capture Entry Price')}</p>
        }
        {locked &&
          <p>{t('New Round will start soon...')}</p>
        }
      </div>
    </div>
  )
}

RoundEmpty.propTypes = {
  round: PropTypes.object.isRequired,
  propagating: PropTypes.bool.isRequired,
}

export default connect(
  (state, props) => {
    const bettorid = getActiveAccountAddress(state)
    const bettorpredictions = getBettorRoundPredictions(state, props.round.roundid, bettorid)
    const winners = getRoundTopWinnerPredictions(state, props.round.roundid)
    const bettors = getRoundTopBettorPredictions(state, props.round.roundid)

    return {
      bettors,
      winners,
      bettorpredictions,
    }
  }
)(React.memo(RoundEmpty))
