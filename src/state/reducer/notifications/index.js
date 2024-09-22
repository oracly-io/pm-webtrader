import { isEmpty, isArray } from 'lodash'
import uuidv4 from '@oracly/pm-libs/uuidv4'
import { set, get } from '@oracly/pm-libs/immutable'
import { success } from '@oracly/pm-libs/redux-cqrs'

import { ADD_NOTIFICATION, HIDE_NOTIFICATION } from '@actions'
import { NOTIFY_ABOUT_FAILED_TRANSACTION } from '@actions'

import { getNotificationByCode, toErrorCode } from '@state/mappers'

const addNotification = (state, data = {}) => {

  const id = data.id || uuidv4()

  if (data.relationid) {
    state = set(state, ['relation', data.relationid], (ids) =>
      isArray(ids) ? [...ids, id] : [id]
    )
  }

  state = set(state, ['collection', id], { ...data, id })

  return state

}

export default {

  [ADD_NOTIFICATION]: (state, data) => addNotification(state, data),

  [HIDE_NOTIFICATION]: (state, { id }) => {

    const notification = get(state, ['collection', id])

    if (!isEmpty(notification)) {
      state = set(state, ['collection', id, 'hidden'], true)
    }

    return state

  },

  [success(NOTIFY_ABOUT_FAILED_TRANSACTION)]: (state, { relationid, result }) => {

    const notification = getNotificationByCode(toErrorCode(result))

    if (notification) state = addNotification(state, { relationid, ...notification })

    return state
  }

}
