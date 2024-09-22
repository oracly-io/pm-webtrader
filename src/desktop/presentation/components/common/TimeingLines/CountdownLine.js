import React from 'react'
import PropTypes from 'prop-types'
import cn from 'clsx'
import { durationToSeconds } from '@oracly/pm-libs/date-utils'
import { htmlPercent } from '@oracly/pm-libs/html-utils'

import { useCountdownUnixTS } from '@hooks'

import css from './TimeingLines.module.scss'

const CountdownLines = ({ endDate, schedule, positioning, className }) => {

  const countdown = useCountdownUnixTS(endDate)
  const seconds = durationToSeconds(countdown)

  const positioningPercent = Math.max((seconds-positioning)/schedule, 0)
  const reoundPercent = Math.min(seconds/schedule, positioning/schedule)

  return (
    <div className={cn(css.lines, className)}>
      <div className={css.active}>
				<span></span>
      </div>
      <div className={css.positioning} style={{ width: htmlPercent(positioningPercent) }}>
      </div>
      <div className={css.round} style={{ width: htmlPercent(reoundPercent) }}>
      </div>
    </div>
  )
}

CountdownLines.propTypes = {
  endDate: PropTypes.number.isRequired,
  schedule: PropTypes.number.isRequired,
  positioning: PropTypes.number.isRequired,
}

export default React.memo(CountdownLines)
