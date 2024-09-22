import React from 'react'
import cn from 'clsx'

import css from './RoundData.module.scss'

const RoundData = ({ className, children }) => {
  return (
    <div className={cn(css.rounddata, className)}>{children}</div>
  )
}

export default RoundData