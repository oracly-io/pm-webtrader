import { pick } from 'lodash'
import { get } from '@oracly/pm-libs/immutable'

export function getNotifications(state) {
  return get(state, ['notifications', 'collection'])
}

export function getRelationNotifications(state, relationid) {
  const nitificationsids = get(state, ['notifications', 'relation', relationid])
  const nitifications = getNotifications(state)

  return pick(nitifications, nitificationsids)
}
