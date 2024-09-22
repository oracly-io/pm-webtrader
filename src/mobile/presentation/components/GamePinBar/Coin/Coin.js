import React from 'react'
import PropTypes from 'prop-types'
import cn from 'clsx'

import { SILVER, GOLD, BRONZE } from '@constants'

import { factoryByCurrency } from '@components/SVG/currency'

import css from './Coin.module.scss'

const Coin = ({ game, className }) => {
  if (!game) return null

  const isBronze = !game.level || game.level === BRONZE
  const isSilver = game.level === SILVER
  const isGold = game.level === GOLD

  const From = factoryByCurrency(game.base)

  return (
    <div
      className={cn(css.gradient, className, {
        [css.golden]: isGold,
        [css.silver]: isSilver,
        [css.bronze]: isBronze,
      })}
    >
      <From />
    </div>
  )
}

Coin.propTypes = {
  className: PropTypes.string,
  game: PropTypes.object.isRequired,
}

export default React.memo(Coin)
