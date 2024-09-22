import React from 'react'
import { map } from 'lodash'

import { connect } from '@state'
import { getNotifications } from '@state/getters'

import PrimaryNotification from './notifications/PrimaryNotification'

import css from './Notifications.module.scss'

const notifications = {
  error: PrimaryNotification,
}

const Notifications = props => {
  return (
    <div className={css.container}>
      {map(props.notifications, (notification, id) => {
        const Notification = notifications[notification.type]

        if (!Notification || notification.hidden) return null

        return <Notification key={id} id={id} {...notification} />
      }).toReversed()}
    </div>
  )
}

export default connect(
  (state) => ({
    notifications: getNotifications(state),
  })
)(React.memo(Notifications))
