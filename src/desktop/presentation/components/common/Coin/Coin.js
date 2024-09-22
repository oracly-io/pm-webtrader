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
      DEMO: Currencies.PREDICTION_GREEN,
      USDC: Currencies.PREDICTION_GREEN,
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
      DEMO: Currencies.PREDICTION_GREEN,
      USDC: Currencies.PREDICTION_GREEN,
    },

  }
}

const Coin = ({ className, type = '', currency, animate = false }) => {

  const Currency = animate
    ? (CURRENCIES.animated[type]?.[currency] || AnimatedCurrencies.UNKNOWN)
    : (CURRENCIES.static[type]?.[currency] || Currencies.UNKNOWN)

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
