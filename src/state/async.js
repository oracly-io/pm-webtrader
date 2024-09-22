import {
  castArray,
  get,
  isEmpty,
  isFunction,
  isString
} from 'lodash'
import { success, fails } from '@oracly/pm-libs/redux-cqrs'
import immutable from '@oracly/pm-libs/immutable'

const inprogress = 'inprogress'
const succeed = 'succeed'
const failed = 'failed'

export function reducer(asyncActionType, pathBuilder) {
  if (!(asyncActionType && isString(asyncActionType))) {
    throw new Error('action type have to be string!')
  }

  const defaultStatus = {
    [inprogress]: false,
    [succeed]: false,
    [failed]: false
  }

  const createHandler = (statusName) =>
    function (oldStatus) {
      const newStatus = immutable.set(defaultStatus, statusName, true)
      if (isFunction(pathBuilder)) {
        const [state, ...args] = arguments // eslint-disable-line
        const paths = castArray(pathBuilder(...args))
        return paths.reduce((statuses, path) => {
          if (path) {
            return immutable.set(statuses, path, (status) => {
              return { ...status, ...newStatus }
            })
          } else {
            return { ...statuses, ...newStatus }
          }
        }, oldStatus)
      } else {
        return newStatus
      }
    }

  return {
    metadata: { default: defaultStatus },
    [asyncActionType]: createHandler(inprogress),
    [success(asyncActionType)]: createHandler(succeed),
    [fails(asyncActionType)]: createHandler(failed)
  }
}

function asyncStatusGetter(props, action) {
  if (!(asyncPrefix(action) in props)) {
    return console.error(`It seems you forgot to pass ...pickAsyncStatus(state, ${action}) via connect`) // eslint-disable-line
  }
  return get(props, [asyncPrefix(action)])
}

function isAsyncStatus(props, action, status) {
  if (!isEmpty(action)) props = asyncStatusGetter(props, action)

  return !!get(props, [status])
}

export function asyncPrefix(action) {
  return '@' + action
}

export function isSucceed(props, action) {
  return isAsyncStatus(props, action, succeed)
}

export function isFailed(props, action) {
  return isAsyncStatus(props, action, failed)
}

export function isInProgress(props, action) {
  return isAsyncStatus(props, action, inprogress)
}

export function isNeverPerformed(props, action) {
  return (
    !isInProgress(props, action) &&
    !isSucceed(props, action) &&
    !isFailed(props, action)
  )
}
