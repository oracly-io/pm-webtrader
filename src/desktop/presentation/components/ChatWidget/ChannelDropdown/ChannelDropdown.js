import React, { useCallback } from 'react'
import { isEmpty } from 'lodash'
import cn from 'clsx'
import { nowUnixTS } from '@oracly/pm-libs/date-utils'

import { UNSUBSCRIBE_MSG, CHAT_ENGLISH } from '@constants'

import Dropdown from '@components/common/Dropdown'
import { getIconByChannel } from '@components/SVG/language'

import { useEffectState } from '@hooks'

import { connect } from '@state'
import { CHAT_SEND, GET_CHAT_CHANNELS, SET_ACTIVE_CHAT_CHENNEL } from '@state/actions'
import { getActiveAccountAddress, getActiveAccountNickname } from '@state/getters'
import { getChatActiveChannel, getChatChannelids } from '@state/getters'
import { isChatConnected, isNeverPerformed } from '@state/getters'
import { getActiveAuthPersonalSignature } from '@state/getters'

import css from './ChannelDropdown.module.scss'

const languagesMap = {
  en: 'English',
  hi: 'Hindi',
  es: 'Spanish',
  zh: 'Chinese',
  ko: 'Korean',
  ru: 'Russian',
}

const getChannelLanguage = (channel = '') => {
  const code = channel.split(':').at(-1)
  return languagesMap[code] || ''
}

const OptionRenderer = ({ option: channel = '' }) => {

  const language = getChannelLanguage(channel)
  const Icon = getIconByChannel(channel)

  return (
    <span className={cn(css.optionRenderer)}>
      <Icon />
      <span className={css.optionLabel}>{language}</span>
    </span>
  )
}

const ChannelDropdown = (props) => {
  const channelids = props.channelids

  useEffectState((state) => {
    if (props.isChatConnected && isNeverPerformed(state, GET_CHAT_CHANNELS)) {
      props.GET_CHAT_CHANNELS()
    }
  }, [props.isChatConnected])

  const handleChange = useCallback((channel) => {

    if (!props.isChatConnected) return
    if (isEmpty(props.psig)) return

    const activeChannel = props.channel

    if (activeChannel !== channel) {

      if (activeChannel !== CHAT_ENGLISH) {
        props.CHAT_SEND({
          sender: props.sender,
          nickname: props.nickname,
          channel: activeChannel,
          type: UNSUBSCRIBE_MSG,
          cts: nowUnixTS(),
          psig: props.psig,
        })
      }

      props.SET_ACTIVE_CHAT_CHENNEL({ channel })
    }
  }, [
    props.isChatConnected,
    props.psig,
    props.sender,
    props.nickname,
    props.channel,
  ])

  const optionRenderer = useCallback((option) => <OptionRenderer option={option} />, [])

  if (isEmpty(channelids)) return null

  const option = channelids.find((channel) => channel === props.channel)

  return (
    <Dropdown
      containerClassName={props.className}
      headerClassName={css.header}
      iconClassName={css.icon}
      bodyClassName={css.body}
      optionClassName={css.option}
      iconColor="#D0D7FF"
      value={option}
      options={channelids}
      onChange={handleChange}
      valueRenderer={optionRenderer}
      optionRenderer={optionRenderer}
    />
  )
}

ChannelDropdown.propTypes = {}

export default connect(
  state => ({
    isChatConnected: isChatConnected(state),
    channel: getChatActiveChannel(state),
    channelids: getChatChannelids(state),
    psig: getActiveAuthPersonalSignature(state),
    sender: getActiveAccountAddress(state),
    nickname: getActiveAccountNickname(state),
  }),
  ({ command, query }) => [
    query(GET_CHAT_CHANNELS),

    command(SET_ACTIVE_CHAT_CHENNEL),
    command(CHAT_SEND),
  ]

)(ChannelDropdown)
