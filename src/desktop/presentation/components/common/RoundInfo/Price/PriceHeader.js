import React from 'react'
import cn from 'clsx'

import { usePriceContext } from './PriceProvider'

import css from './PriceHeader.module.scss'

export const PriceHeader = ({ className, descriptionIcon, description, descriptionTitle, value, valueIcon, valueTitle }) => {
  const { expand, expanded } = usePriceContext()

  return (
    <div className={cn(css.pheader, className)} onClick={expand}>
      <div className={css.description}>
        <div
          className={cn(css.moreinfo, { [css.expanded]: expanded })}
          title={descriptionTitle}
        >
          {descriptionIcon}
        </div>
        <span>{description}</span>
      </div>
      <div className={css.value}>
        {valueIcon}
        <span title={valueTitle}>
          {value}
        </span>
      </div>
    </div>
  )
}
