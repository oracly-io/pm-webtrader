import React from 'react'
import PropTypes from 'prop-types'

import RoundPredictions from '../RoundPredictions'
import RoundHistoricalPrediction from '../RoundHistoricalPrediction'

const RoundHistoricalPredictions = (props) => {
  return (
    <RoundPredictions
      className={props.className}
      predictions={props.predictions}
    >
      {(predictions) => predictions.map((prediction) => (
        <RoundHistoricalPrediction
          key={prediction.predictionid}
          game={props.game}
          round={props.round}
          prediction={prediction}
        />
      ))}
    </RoundPredictions>
  )
}

RoundHistoricalPredictions.propTypes = {
  game: PropTypes.object.isRequired,
  round: PropTypes.object.isRequired,
}


export default React.memo(RoundHistoricalPredictions)
