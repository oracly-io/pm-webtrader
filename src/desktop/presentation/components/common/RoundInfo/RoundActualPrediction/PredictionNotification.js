import React from 'react'
import PropTypes from 'prop-types'
import cn from 'clsx'

import { getSVGComponent } from '@components/SVG'

import css from './PredictionNotification.module.scss'

const PredictionNotification = ({ icon, message, type }) => {

  const Icon = getSVGComponent(icon)

  return (
    <div className={cn(css.notification, {
      [css.error]: type === 'error',
    })}>
      {Icon && <span className={css.icon}><Icon /></span>}
      <div className={css.message}>{message}</div>
    </div>
  )
}

PredictionNotification.propTypes = {
  icon: PropTypes.string,
  message: PropTypes.string,
  type: PropTypes.string,
}

export default PredictionNotification