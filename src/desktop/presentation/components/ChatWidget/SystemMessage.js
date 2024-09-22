import React from 'react'
import cn from 'clsx'
import { formatUnixTS, toLocalStringUnixTS } from '@oracly/pm-libs/date-utils'

import { isEmpty } from 'lodash'

import { SUBSCRIBE_MSG, UNSUBSCRIBE_MSG } from '@constants'

import { useTranslate } from '@lib/i18n-utils'

import { connect } from '@state'
import { getActiveAccountAddress } from '@state/getters'

import css from './SystemMessage.module.scss'

export const SystemMessage = ({ message, host }) => {

  const t = useTranslate()

  let autogen = {
    [SUBSCRIBE_MSG]: t('{{username}} Entered Channel!', { username: message.sender }),
    [UNSUBSCRIBE_MSG]: t('{{username}} Left Channel!', { username: message.sender }),
  }
  if (message.sender === host) {
    autogen = {
      [SUBSCRIBE_MSG]: t('You Entered Channel!'),
      [UNSUBSCRIBE_MSG]: t('Unsubscribed!'),
    }
  }

  const text = autogen[message?.type] || ''

  if (isEmpty(text) || isEmpty(message)) return null
  return (
    <div className={cn(css.message, { [css.phantom]: message.phantom })}>
      <div className={css.inner}>

        <div className={css.content}>

          <div className={css.header}>
            <div
              className={css.timestamp}
              title={toLocalStringUnixTS(message.timestamp)}
            >
              {formatUnixTS(message.timestamp, 'p')}
            </div>
          </div>

          <div className={css.text}>
            {text}
          </div>

        </div>

      </div>
    </div>
  )
}

export default connect(
  (state, props) => ({
    host: getActiveAccountAddress(state),
  })
)(React.memo(SystemMessage))
