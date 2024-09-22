import React from 'react'
import cn from 'clsx'

import { usePriceContext } from './PriceProvider'
import ArrowUp from '@components/SVG/ArrowUp'

import css from './PriceHide.module.scss'

export const PriceHide = () => {
  const { expanded, expand } = usePriceContext()

  return (
    <div className={cn(css.container, { [css.expanded]: expanded })} onClick={expand}>
      <span>Hide details</span>
      <ArrowUp />
    </div>
  )
}