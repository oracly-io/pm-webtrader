import { get } from '@oracly/pm-libs/immutable'

import { getActiveAccountAddress } from '@state/getters/bettors'

function getUserByAddress(state, address) {
  const account = get(state, ['users', address])
  return account
}

export function getActiveAccountNickname(state) {
  const address = getActiveAccountAddress(state)
  const nickname = getAccountNickname(state, address)
  return nickname
}

export function getAccountNickname(state, address) {
  if (!address) return null

  const user = getUserByAddress(state, address)
  const nickname = get(user, ['nickname'])

  return nickname
}

export function isAccountNicknameStatus(state, address, target) {
  const user = getUserByAddress(state, address)
  const status = get(user, ['status'])

  return target === status
}

