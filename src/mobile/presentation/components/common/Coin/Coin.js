import React from 'react'
import cn from 'clsx'
import PropTypes from 'prop-types'

import * as AnimatedCurrencies from './AnimatedCurrencies'
import * as Currencies from './Currencies'

import css from './Coin.module.scss'

const CURRENCIES = {
  animated: {
    gold: {
      DEMO: AnimatedCurrencies.DEMO_GOLD,
      USDC: AnimatedCurrencies.USDC_GOLD,
    },

    silver: {
      DEMO: AnimatedCurrencies.DEMO_SILVER,
      USDC: AnimatedCurrencies.USDC_SILVER,
    },

    green: {
      // keep static
      DEMO: Currencies.DEMO_GREEN,
      USDC: Currencies.DEMO_GREEN,
    },

  },

  static: {
    gold: {
      DEMO: Currencies.DEMO_GOLD,
      USDC: Currencies.USDC_GOLD,
    },

    silver: {
      DEMO: Currencies.DEMO_SILVER,
      USDC: Currencies.USDC_SILVER,
    },

    green: {
      DEMO: Currencies.DEMO_GREEN,
      USDC: Currencies.DEMO_GREEN,
    },
  }
}

const Coin = ({ className, type = '', currency, animate = false }) => {

  const currencies = animate ? CURRENCIES.animated : CURRENCIES.static
  const Currency = currencies[type]?.[currency]

  const gold = type === 'gold'
  const silver = type === 'silver'
  const green = type === 'green'

  return (
    <div className={cn(css.coin, className, {
      [css.gold]: gold,
      [css.silver]: silver,
      [css.green]: green,
    })}>
      {Currency && <Currency />}
    </div>
  )
}

Coin.propTypes = {
  className: PropTypes.string,
  animate: PropTypes.bool,
  currency: PropTypes.oneOf(['DEMO', 'USDC']).isRequired,
  type: PropTypes.oneOf(['gold', 'silver', 'green']).isRequired,
}

export default Coin
