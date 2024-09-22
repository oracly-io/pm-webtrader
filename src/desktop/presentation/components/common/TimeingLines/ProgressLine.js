import React from 'react'
import cn from 'clsx'

import css from './TimeingLines.module.scss'

const ProgressLine = ({ idel, className }) => {

  return (
    <div className={cn(css.lines, css.progress, className)}>
      <div className={cn({
        [css.active]: !idel,
        [css.inactive]: idel,
      })}>
				<span></span>
      </div>
    </div>
  )
}

export default React.memo(ProgressLine)
