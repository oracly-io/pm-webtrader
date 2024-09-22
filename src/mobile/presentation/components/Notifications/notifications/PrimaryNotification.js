import React, { useCallback, useEffect, useState } from 'react'
import cn from 'clsx'
import PropTypes from 'prop-types'

import { HIDE_NOTIFICATION } from '@actions'

import { getSVGComponent } from '@components/SVG'
import CloseIcon from '@components/SVG/RoundListClose'

import { connect } from '@state'

import css from './PrimaryNotification.module.scss'

const delay = 5000

const PrimaryNotification = (props) => {
  const { type, message, icon, id } = props

  const Icon = getSVGComponent(icon)

  const [show, setShow] = useState(true)

  const close = useCallback(() => props.HIDE_NOTIFICATION({ id }), [id])

  useEffect(() => {
    const timeoutHide = setTimeout(() => setShow(false), delay)
    const timeoutClose = setTimeout(() => close(), delay + 200)

    return () => {
      clearTimeout(timeoutHide)
      clearTimeout(timeoutClose)
    }
  }, [close])

  return (
    <div
      className={cn(css.container, {
        [css.error]: type === 'error',
        [css.show]: show,
        [css.hide]: !show,
      })}
    >
      {Icon && (
        <span className={css.icon}>
          <Icon />
        </span>
      )}
      <span className={css.message}>{message}</span>
      <div className={css.close} onClick={close}>
        <CloseIcon />
      </div>
    </div>
  )
}

PrimaryNotification.propTypes = {
  id: PropTypes.string.isRequired,
}

export default connect(null, ({ command }) => [command(HIDE_NOTIFICATION)])(
  React.memo(PrimaryNotification)
)
