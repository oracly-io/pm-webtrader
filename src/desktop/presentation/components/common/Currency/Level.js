import React from 'react'
import cn from 'clsx'
import PropTypes from 'prop-types'

import { factoryFunds } from '@components/SVG/currency/funds'

import { SILVER, GOLD, BRONZE } from '@constants'

import css from './Level.module.scss'

const Level = ({ className, currency, type }) => {

  const Currency = factoryFunds(currency)

  return (
    <div className={cn(css.level, {
      [css.bronze]: type === BRONZE,
      [css.silver]: type === SILVER,
      [css.gold]: type === GOLD,
      [css.allinone]: !type
    }, className)}>
      <Currency />
    </div>
  )

}

Level.propTypes = {
  className: PropTypes.string,
  currency: PropTypes.string,
  type: PropTypes.oneOf([SILVER, GOLD, BRONZE])
}

export default React.memo(Level)
