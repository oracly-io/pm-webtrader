import React from 'react'
import PropTypes from 'prop-types'
import cn from 'clsx'

import RoundPredictions from '../RoundPredictions'
import RoundActualPrediction from '../RoundActualPrediction'

import css from './RoundActualPredictions.module.scss'

const RoundActualPredictions = (props) => {
  return (
    <RoundPredictions
      className={(cn(css.predictions, props.className))}
      predictions={props.predictions}
    >
      {(predictions) => predictions.map((prediction) => (
        <RoundActualPrediction
          key={prediction.predictionid}
          winClassName={props.winClassName}
          game={props.game}
          round={props.round}
          prediction={prediction}
        />
      ))}
    </RoundPredictions>
  )
}

RoundActualPredictions.propTypes = {
  winClassName: PropTypes.string,
  game: PropTypes.object.isRequired,
  round: PropTypes.object.isRequired,
}

export default React.memo(RoundActualPredictions)
