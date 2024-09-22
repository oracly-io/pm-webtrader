import logger from '@lib/logger'
import { command } from '@oracly/pm-libs/redux-cqrs'
import { ChatSocket } from '@oracly/pm-libs/pm-socket-client'

import { CHAT_CONNECTED, CHAT_DISCONNECTED, CHAT_RECEIVE } from '@actions'

import config from '@config'


export default function initSockets(store) {
  logger.info('Init chat socket')

  ChatSocket.baseUrl = config.chat_ws_url

  ChatSocket.onMessageReceived = ({ message, messages }) => {
    store.dispatch(command(CHAT_RECEIVE, { message, messages }))
  }

  let attempt = 0
  let timeout

  ChatSocket.onConnectionOpened = () => {
    clearTimeout(timeout)
    attempt = 0
    store.dispatch(command(CHAT_CONNECTED))
  }
  ChatSocket.onConnectionClosed = () => {
    store.dispatch(command(CHAT_DISCONNECTED))

    attempt++
    logger.warn('Chat cannot connect via socket, reconnection attemp %i', attempt)
    timeout = setTimeout(() => ChatSocket.connect(), config.chat_reconnect_period * attempt)
  }

  ChatSocket.connect()

}
