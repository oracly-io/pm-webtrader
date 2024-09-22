import React from 'react'
import cn from 'clsx'

import { usePriceContext } from './PriceProvider'

import css from './PriceDetails.module.scss'

export const PriceDetails = ({ className, children }) => {
  const { expanded } = usePriceContext()

  return (
    <div className={cn(css.container, className, { [css.expanded]: expanded })}>
      <div className={css.details}>
        {children}
      </div>
    </div>
  )
}