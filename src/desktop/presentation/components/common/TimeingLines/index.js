import React from 'react'
import PropTypes from 'prop-types'
import { nowUnixTS } from '@oracly/pm-libs/date-utils'

import { useRenderAt } from '@hooks'

import ProgressLine from './ProgressLine'
import CountdownLine from './CountdownLine'

const TimeingLines = (props) => {

  useRenderAt(props.endDate)

  if (props.endDate > nowUnixTS() && !props.idel) {
    return <CountdownLine {...props} />
  } else {
    return <ProgressLine {...props}/>
  }

}

TimeingLines.propTypes = {
  endDate: PropTypes.number.isRequired,
  schedule: PropTypes.number.isRequired,
  positioning: PropTypes.number.isRequired,
}

export default React.memo(TimeingLines)
