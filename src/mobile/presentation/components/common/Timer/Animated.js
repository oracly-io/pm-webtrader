import React, { useEffect, useState } from 'react'
import { isNaN, isFunction, ceil } from 'lodash'
import cn from 'clsx'
import { difInSecondsUnixTS, nowUnixTS } from '@oracly/pm-libs/date-utils'

import { useCountdownUnixTS } from '@hooks'

import css from '@styles/components/common/timer/animated.module.scss'

const calcDegree = (totalSeconds, elapsedSeconds, dasharray) => {
  return dasharray - ceil(dasharray / (totalSeconds / elapsedSeconds))
}

const AnimatedTimer = ({ startUnixTS, endUnixTS, onElapsed, onTicked, circleClass, progressClass, radius, children }) => {

  const countdown = useCountdownUnixTS(endUnixTS, [endUnixTS])
  const [elapsed, setElapsed] = useState(false)

  const totalSeconds = difInSecondsUnixTS(endUnixTS, startUnixTS)
  const elapsedSeconds = difInSecondsUnixTS(endUnixTS)

  const diameter = 2 * radius
  const dasharray = diameter * Math.PI
  const degree = calcDegree(totalSeconds, elapsedSeconds, dasharray)

  useEffect(() => {

    if (isFunction(onTicked)) onTicked(countdown)

    if (elapsed && nowUnixTS() < endUnixTS) {
      setElapsed(false)
    }

    if (!elapsed && nowUnixTS() >= endUnixTS) {
      if (isFunction(onElapsed)) onElapsed()
      setElapsed(true)
    }

  }, [countdown.seconds])

  return (
    !isNaN(degree) &&
    <div className={css.timer} style={{ width: diameter, height: diameter }}>
      <div className={cn(css.circle, circleClass)}></div>
      <div className={cn(css.progress, progressClass)}>
        <svg viewBox={`0 0 ${diameter} ${diameter}`}>
          <circle
            cx="50%"
            cy="50%"
            r="50%"
            strokeDashoffset={Math.max(degree * -1, dasharray * -0.99)}
            strokeDasharray={dasharray}
            transform={`rotate(270 ${radius} ${radius})`}
          />
        </svg>
      </div>
      <div className={css.inner}>
        {children}
      </div>
    </div>
  )

}

export default React.memo(AnimatedTimer)
