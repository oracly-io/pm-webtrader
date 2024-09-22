import React, { useCallback, useState } from 'react'
import PropTypes from 'prop-types'
import cn from 'clsx'
import { durationToSeconds, nowUnixTS } from '@oracly/pm-libs/date-utils'

import config from '@config'
import Clock from '@components/SVG/Clock'
import Info from '@components/SVG/Info'
import Countdown from '@components/common/Timer/Countdown'

import { useTranslate } from '@lib/i18n-utils'

import css from './RoundExpiration.module.scss'

const RoundExpiration = ({ round }) => {
  const t = useTranslate()

  const [notify, setNotify] = useState(false)
  const [expired, setExpired] = useState(!round?.resolved && round?.expirationDate <= nowUnixTS())

  const formatDuration = useCallback((duration) => {
    const keys = ['days', 'hours', 'minutes', 'seconds']

    const index = keys.findIndex(key => duration[key])
    if (index === -1 || duration.seconds < 0) return '0'

    const key = keys[index]

    return `${duration[key]}${key[0]}`
  }, [])

  const onTicked = useCallback((duration) => {
    if (durationToSeconds(duration) < config.round_expiration_notification_ts && !notify) setNotify(true)
  }, [notify])

  const onElapsed = useCallback(() => setExpired(true), [])

  if (!round) return null
  if (round.resolved) return null
  return (
    <div className={cn(css.container, {
      [css.warning]: notify || expired,
      [css.expired]: expired,
    })}>

      <span className={css.clock}><Clock /></span>

      <span className={css.time}>
        {expired ? '0' : (
          <Countdown
            unixTS={round.expirationDate}
            format={formatDuration}
            onTicked={onTicked}
            onElapsed={onElapsed}
          />
        )}
      </span>

      <div />

      <span className={css.title}>
        {expired ? t('Round Expired!') : t('Unverified Round Expires!')}
      </span>

      <span
        className={css.info}
        title={expired ? t('"Withdraw" Funds') : t('First "Withdraw" Verifies Round')}
      >
        <Info />
      </span>

    </div>
  )
}

RoundExpiration.propTypes = {
  round: PropTypes.object,
}

export default RoundExpiration
