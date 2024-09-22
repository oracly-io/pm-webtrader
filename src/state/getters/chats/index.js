import { keys } from 'lodash'
import { get } from '@oracly/pm-libs/immutable'

import { getActiveAccountAddress } from '@state/getters'

export function isChatConnected(state) {
  return !!get(state, ['chats', 'connected'])
}

export function getChatMessageIdsByChannel(state, channel) {
  return get(state, ['chats', 'channels', channel])
}

export function getChatMessageById(state, messageid) {
  return get(state, ['chats', 'messages', messageid])
}

export function getSubscribedChatChannels(state, host) {
  return keys(get(state, ['chats', 'subscribed', host]))
}

export function isChatSubscribed(state, host, channel) {
  return get(state, ['chats', 'subscribed', host, channel]) === channel
}

export function getChatActiveChannel(state) {
  return get(state, ['chats', 'active', 'channel'])
}
export function getChatChannelids(state) {
  return get(state, ['chats', 'channelids'])
}
export function getChatChannelOnline(state, channel) {
  return get(state, ['chats', 'online', channel]) || 0
}

export function getChatActiveChannelMessageIds(state) {
  const channel = getChatActiveChannel(state)
  const mesaggeids = getChatMessageIdsByChannel(state, channel)

  return mesaggeids
}

export function isChatReady(state) {
  const channel = getChatActiveChannel(state)
  const host = getActiveAccountAddress(state)

  return isChatSubscribed(state, host, channel) && isChatConnected(state)
}
