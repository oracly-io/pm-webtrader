import { get } from '@oracly/pm-libs/immutable'

export function isOffline(state) {
  return get(state, 'application.connection.isOnline') === false
}

export function isOnline(state) {
  return get(state, 'application.connection.isOnline') === true
}

export function isReady(state) {
  return get(state, 'application.status.initialized') === true
}

export function getTheme(state) {
  return get(state, 'application.theme')
}

export function getNetworkStatus(state) {
  return get(state, 'application.network.status')
}
