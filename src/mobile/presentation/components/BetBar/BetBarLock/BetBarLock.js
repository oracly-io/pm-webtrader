import React from 'react'
import PropTypes from 'prop-types'

import { useTranslate } from '@lib/i18n-utils'
import Countdown from '@components/common/Timer/Countdown'
import Clock from '@components/SVG/Clock'

import css from './BetBarLock.module.scss'

const BetBarLock = ({ endDate }) => {
  const t = useTranslate()
  return (
    <div className={css.container}>
      <div className={css.timer}>
        <span className={css.icon}>
          <Clock />
        </span>

        <Countdown className={css.countdown} unixTS={endDate} />
      </div>
      <div className={css.description}>
        {t('Positioning is underway, the game will begin soon.')}
      </div>
    </div>
  )
}

BetBarLock.propTypes = {
  endDate: PropTypes.number.isRequired,
}

export default BetBarLock
