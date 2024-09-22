import { isString } from 'lodash'
import { get } from '@oracly/pm-libs/immutable'

import { getActiveAccountAddress } from '@state/getters/bettors'
import { getAccountNickname } from '@state/getters/users'

function getAuthData(state) {
  return get(state, ['auth'])
}

export function getActiveAuthPersonalSignature(state) {
  const address = getActiveAccountAddress(state)
  const nickname = getAccountNickname(state, address)
  const psig = getAuthPersonalSignature(state, address, nickname)
  return psig
}

export function getAuthPersonalSignature(state, address, nickname) {
  if (!isString(nickname)) return null

  const authdata = getAuthData(state)
  const psig = get(authdata, [address, nickname || address, 'psig'])
  return psig
}
