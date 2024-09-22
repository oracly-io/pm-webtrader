import React, { useCallback } from 'react'
import { isEmpty } from 'lodash'

import { SET_SHOW_STATISTICS_BAR } from '@actions'

import { connect } from '@state'

import { getChatMessageById, getActiveAccountAddress } from '@state/getters'
import { isSystem } from '@state/mappers'

import RemoteMessage from '@components/ChatWidget/RemoteMessage'
import SelfMessage from '@components/ChatWidget/SelfMessage'
import SystemMessage from '@components/ChatWidget/SystemMessage'

import css from './Message.module.scss'

export const Message = (props) => {
  const { message, bettor } = props

  const handleUsernameClick = useCallback((event) => {
    const userAddress = event.currentTarget.getAttribute('data-username')
    props.SET_SHOW_STATISTICS_BAR({ account: userAddress, isOpened: true })
  }, [])

  if (isEmpty(message) || isEmpty(bettor)) return null

  const isRemote = message.sender !== bettor
  const isSelf = message.sender === bettor

  return (
    <div className={css.message}>
      {isSystem(message) && <SystemMessage message={message} bettor={bettor} />}
      {isRemote && <RemoteMessage message={message} bettor={bettor} onUsernameClick={handleUsernameClick} />}
      {isSelf && <SelfMessage message={message} bettor={bettor} onUsernameClick={handleUsernameClick} />}
    </div>
  )
}

export default connect(
  (state, props) => ({
    message: getChatMessageById(state, props?.messageid),
    bettor: getActiveAccountAddress(state),
  }),
  ({ command }) => [
    command(SET_SHOW_STATISTICS_BAR),
  ]
)(React.memo(Message))
