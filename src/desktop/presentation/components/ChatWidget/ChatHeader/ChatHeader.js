import React from 'react'
import cn from 'clsx'

import { CHAT_ENGLISH, LT } from '@constants'
import UsersIcon from '@components/SVG/Users'
import { useTranslate } from '@lib/i18n-utils'

import { connect } from '@state'
import { GET_CHAT_CHANNEL_ONLINE } from '@state/actions'
import { getChatActiveChannel, getChatChannelOnline } from '@state/getters'
import { isChatReady, isNeverPerformed } from '@state/getters'
import { isChatConnected } from '@state/getters'
import { useScheduledQuery } from '@hooks'

import ChannelDropdown from '../ChannelDropdown'

import css from './ChatHeader.module.scss'

const ChatHeader = (props) => {
  const t = useTranslate()

  useScheduledQuery((query, state) => {

    if (props.isChatConnected && props.channel) {
      const loadNeverPerformad = isNeverPerformed(
        state, GET_CHAT_CHANNEL_ONLINE, [CHAT_ENGLISH, LT.INITIAL]
      )
      const loadType = loadNeverPerformad ? LT.INITIAL : LT.UPDATE
      query(
        GET_CHAT_CHANNEL_ONLINE,
        { channel: props.channel, loadType },
        { schedule: 5 }
      )
    }
  }, [props.channel, props.isChatConnected])

  const online = props.online || (props.isChatReady ? 1 : 0)

  return (
    <div className={cn(css.container, {
      // [css.collapsed]: props.collapsed,
      [css.disconnected]: !props.isChatConnected,
    })}>

      <div className={css.section}>
        <div className={css.title}>{t('Chat')}</div>
        <div></div>
      </div>

      <div className={css.section}>
        <div className={css.content}>
          <div className={css.online}>
            <span className={css.amount}>{online}</span>
            <span className={css.icon}><UsersIcon /></span>
          </div>
          <div className={css.channels}>
            <ChannelDropdown />
          </div>
        </div>
      </div>

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
)(React.memo(ChatHeader))