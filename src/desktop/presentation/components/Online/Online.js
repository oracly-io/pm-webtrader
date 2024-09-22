import React from 'react'
import cn from 'clsx'

import { LT, CHAT_ENGLISH } from '@constants'
import UsersOnline from '@components/SVG/UsersOnline'
import Spinner from '@components/common/Spinner'
import { useScheduledQuery } from '@hooks'
import { connect } from '@state'
import { getChatChannelOnline, isInitialLoading, isOnline } from '@state/getters'
import { isNeverPerformed } from '@state/getters'
import { GET_CHAT_CHANNEL_ONLINE } from '@state/actions'

import css from './Online.module.scss'

const Online = ({ isLoading, isOnline, online }) => {

  useScheduledQuery((query, state) => {
    const loadNeverPerformad = isNeverPerformed(
      state, GET_CHAT_CHANNEL_ONLINE, [CHAT_ENGLISH, LT.INITIAL]
    )
    const loadType = loadNeverPerformad ? LT.INITIAL : LT.UPDATE
    query(GET_CHAT_CHANNEL_ONLINE, { channel: CHAT_ENGLISH, loadType }, { schedule: 5 })
  }, [])

  return (
    <div className={css.container}>
      <div className={css.icon}>
        <span className={cn(css.circle, {
          [css.success]: isOnline,
          [css.error]: !isOnline,
        })} />
        <UsersOnline />
      </div>
      {isLoading ? (
        <Spinner className={css.spinner} />
      ) : (
        <span className={css.amount}>{online}</span>
      )}
    </div>
  )
}

export default connect(
  (state) => {
    const isLoading = isInitialLoading(state, GET_CHAT_CHANNEL_ONLINE, [CHAT_ENGLISH])
    const online = getChatChannelOnline(state, CHAT_ENGLISH)

    return {
      online,
      isLoading,
      isOnline: isOnline(state)
    }
  },
)(React.memo(Online))