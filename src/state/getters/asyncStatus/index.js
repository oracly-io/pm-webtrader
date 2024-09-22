import { reduce, isArray, isString, isEmpty } from 'lodash'
import { get } from '@oracly/pm-libs/immutable'

import { LT } from '@constants'
import { asyncPrefix, isInProgress } from '@state/async'
import { isFailed as isFailedAsync } from '@state/async'
import { isSucceed as isSucceedAsync } from '@state/async'
import { isNeverPerformed as isNeverPerformedAsync } from '@state/async'

export function getAsyncStatus(state, action, path = []) {
  const reducerState = get(state, ['asyncStatus', action])
  if (isEmpty(reducerState)) console.error(`It seems you forgot to create asyncStateReducer(${action})`) // eslint-disable-line
  return get(state, ['asyncStatus', action].concat(path))
}

export function pickAsyncStatus(state, actions, path = []) {
  if (isString(state)) console.error('It seems you forgot to pass state as first paramenter to pickAsyncStatus') // eslint-disable-line
  if (!isArray(actions)) actions = [actions]

  return reduce(actions, (arg, action) => {
    arg[asyncPrefix(action)] = getAsyncStatus(state, action, path)
    return arg
  }, {})
}

export function isLoading(state, action, path = []) {
  return isInProgress(pickAsyncStatus(state, action, path), action)
}

export function isSucceed(state, action, path = []) {
  return isSucceedAsync(pickAsyncStatus(state, action, path), action)
}

export function isFailed(state, action, path = []) {
  return isFailedAsync(pickAsyncStatus(state, action, path), action)
}

export function isInitialLoading(state, action, path = []) {
  return isLoading(state, action, [...path, LT.INITIAL])
}

export function isScrollLoading(state, action, path = []) {
  return isLoading(state, action, [...path, LT.SCROLL])
}

export function isScrollFailed(state, action, path = []) {
  return isFailed(state, action, [...path, LT.SCROLL])
}

export function isNeverPerformed(state, action, path = []) {
  return isNeverPerformedAsync(pickAsyncStatus(state, action, path), action)
}