import { isEmpty, orderBy, castArray } from 'lodash'
import { set, get, del } from '@oracly/pm-libs/immutable'
import { success } from '@oracly/pm-libs/redux-cqrs'

import { isSystem } from '@state/mappers'

import {
  CHAT_CONNECTED,
  CHAT_DISCONNECTED,
  CHAT_SEND,
  CHAT_RECEIVE,
  GET_CHAT_CHANNELS,
  GET_CHAT_CHANNEL_ONLINE,
  SET_ACTIVE_CHAT_CHENNEL,
} from '@state/actions'
import { SUBSCRIBE_MSG, UNSUBSCRIBE_MSG } from '@constants'
import { CHAT_ENGLISH } from '@constants'
import { PING_MSG, PONG_MSG } from '@constants'

import { createMessage, toMessageId, tokenize } from '@state/mappers'

function appendNew(state, message) {

  const cmsg = get(state, ['messages', message.messageid])
  if (!isEmpty(cmsg)) return state

  state = set(state, ['messages', message.messageid], message)

  if (!isSystem(message)) {

    state = set(state, ['channels', message.channel], ids => {
      if (!Array.isArray(ids)) ids = []
      return orderBy([...ids, message.messageid], mid => get(state, ['messages', mid, 'timestamp']) || get(state, ['messages', mid, 'cts']))
    })

  }

  return state
}

export default {

  metadata: {
    default: {
      active: { channel: CHAT_ENGLISH }
    }
  },

  [success(GET_CHAT_CHANNELS)]: (state, { result: { data: channels = [] } }) => {

    state = set(state, ['channelids'], channels)

    return state

  },

  [success(GET_CHAT_CHANNEL_ONLINE)]: (state, { channel, result: { data: online } }) => {

    state = set(state, ['online', channel], online)

    return state

  },

  [CHAT_SEND]: (state, { sender, content, channel, cts, type }) => {

    if (type === PING_MSG) return state

    const message = createMessage({ sender, content, channel, cts, type })
    if (isEmpty(message)) return state

    state = appendNew(state, message)

    return state

  },

  [SET_ACTIVE_CHAT_CHENNEL]: (state, { channel }) => {
    state = set(state, ['active', 'channel'], channel)

    return state
  },

  [CHAT_RECEIVE]: (state, { message, messages }) => {

    if (isEmpty(message) && isEmpty(messages)) messages = []
    if (isEmpty(messages)) messages = castArray(message)

    for (const msg of messages) {

      if (msg.type === PONG_MSG) continue

      msg.messageid = toMessageId(msg)
      msg.words = tokenize(msg.content)

      state = appendNew(state, msg)

      // force update
      state = set(state, ['messages', msg.messageid], msg)

      if (msg.type === SUBSCRIBE_MSG) {
        state = set(state, ['subscribed', msg.sender, msg.channel], msg.channel)
      } else if (msg.type === UNSUBSCRIBE_MSG) {
        state = del(state, ['subscribed', msg.sender, msg.channel])
      }

    }

    return state

  },

  [CHAT_CONNECTED]: (state) => {

    state = set(state, ['connected'], true)

    return state
  },

  [CHAT_DISCONNECTED]: (state) => {

    state = set(state, ['connected'], false)
    state = del(state, ['subscribed'])

    return state
  },

}
