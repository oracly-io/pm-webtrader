import React from 'react'
import cn from 'clsx'
import PropTypes from 'prop-types'

import { SILVER, GOLD, BRONZE } from '@constants'

import { useTranslate } from '@lib/i18n-utils'

import css from './LevelTag.module.scss'

const LevelTag = ({ className, game }) => {
  const t = useTranslate()

  if (!game) return null

  const isBronze = !game.level || game.level === BRONZE
  const isSilver = game.level === SILVER
  const isGold = game.level === GOLD

  let level = t('Bronze')
  if (isSilver) level = t('Silver')
  if (isGold) level = t('Gold')

  return (
    <div className={cn(
      css.leveltag,
      className,
      {
        [css.bronze]: isBronze,
        [css.silver]: isSilver,
        [css.gold]: isGold,
      }
    )}
    title={
      t('Round Level "{{level}}" minimum wager is {{minWager}} {{currency}}',
        { level, minWager: game.minWager, currency: game.currency }
      )
    }
    >
      {level}
    </div>
  )

}

LevelTag.propTypes = {
  className: PropTypes.string,
  game: PropTypes.object.isRequired,
}

export default React.memo(LevelTag)

