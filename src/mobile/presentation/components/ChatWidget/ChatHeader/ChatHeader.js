import React from 'react'
import cn from 'clsx'

import Button from '@components/common/Button'
import CloseIcon from '@components/SVG/RoundListClose'
import UsersIcon from '@components/SVG/Users'
import { useTranslate } from '@lib/i18n-utils'

import { connect } from '@state'
import { GET_CHAT_CHANNEL_ONLINE } from '@state/actions'
import { TOGGLE_TOOLBAR } from '@actions'
import {
  getChatActiveChannel,
  getChatChannelOnline,
  isChatReady,
} from '@state/getters'
import { isChatConnected } from '@state/getters'
import { useScheduledQuery } from '@hooks'

import { TOOLBAR_CHAT } from '@constants'

import ChannelDropdown from '../ChannelDropdown'

import css from './ChatHeader.module.scss'

const ChatHeader = (props) => {
  const t = useTranslate()

  useScheduledQuery(
    (query) => {
      if (props.isChatConnected && props.channel) {
        query(
          GET_CHAT_CHANNEL_ONLINE,
          { channel: props.channel },
          { schedule: 5 }
        )
      }
    },
    [props.channel, props.isChatConnected]
  )

  const online = props.online || (props.isChatReady ? 1 : 0)

  return (
    <div
      className={cn(css.container, {
        // [css.collapsed]: props.collapsed,
        [css.disconnected]: !props.isChatConnected,
      })}
    >
      <div className={css.section}>
        <div className={css.title}>{t('Chat')}</div>
        <div></div>
      </div>

      <div className={css.section}>
        <div className={css.content}>
          <div className={css.online}>
            <span className={css.amount}>{online}</span>
            <span className={css.icon}>
              <UsersIcon />
            </span>
          </div>
          <div className={css.channels}>
            <ChannelDropdown />
          </div>
        </div>
      </div>
      <Button
        className={css.close}
        onClick={() => props.TOGGLE_TOOLBAR({ type: TOOLBAR_CHAT })}
      >
        <CloseIcon />
      </Button>
    </div>
  )
}

ChatHeader.propTypes = {}

export default connect(
  (state) => {
    const channel = getChatActiveChannel(state)
    const online = getChatChannelOnline(state, channel)

    return {
      channel,
      online,
      isChatConnected: isChatConnected(state),
      isChatReady: isChatReady(state),
    }
  },
  ({ command }) => [command(TOGGLE_TOOLBAR)]
)(React.memo(ChatHeader))
