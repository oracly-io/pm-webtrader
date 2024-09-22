import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { isFunction } from 'lodash'
import { formatDuration, nowUnixTS } from '@oracly/pm-libs/date-utils'

import { useCountdownUnixTS } from '@hooks'

const CountdownTimer = ({ unixTS, onElapsed, onTicked, className, format = formatDuration }) => {

  const endDate = unixTS
  const countdown = useCountdownUnixTS(endDate)
  const [elapsed, setElapsed] = useState(false)

  useEffect(() => {

    if (isFunction(onTicked)) onTicked(countdown)

    if (elapsed && nowUnixTS() < endDate) {
      setElapsed(false)
    }

    if (nowUnixTS() >= endDate) {
      if (isFunction(onElapsed)) onElapsed()
      if (!elapsed) setElapsed(true)
    }

  }, [countdown.seconds, endDate])

  return (
    <span className={className}>
      {elapsed && 1}
      {!elapsed && format(countdown)}
    </span>
  )

}

CountdownTimer.propTypes = {
  unixTS: PropTypes.number.isRequired,
  onElapsed: PropTypes.func,
  onTicked: PropTypes.func,
}

export default React.memo(CountdownTimer)
