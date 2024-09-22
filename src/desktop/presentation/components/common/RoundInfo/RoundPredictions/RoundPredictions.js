import React from 'react'
import PropTypes from 'prop-types'
import { isEmpty } from 'lodash'
import cn from 'clsx'

import { DOWN, EQUAL, UP } from '@constants'

import css from './RoundPredictions.module.scss'

const ORDER = {
  [UP]: 0,
  [EQUAL]: 1,
  [DOWN]: 2,
}

const RoundPredictions = (props) => {

  const predictions = props.predictions
  const className = props.className

  if (isEmpty(predictions)) return null

  const sortedpredictions = predictions.sort((p1, p2) => ORDER[p1.position] - ORDER[p2.position])

  return (
    <div className={cn(css.predictions, className)}>
      {props.children(sortedpredictions)}
    </div>
  )
}

RoundPredictions.propTypes = {
  className: PropTypes.string,
  children: PropTypes.func.isRequired,
}

export default React.memo(RoundPredictions)
