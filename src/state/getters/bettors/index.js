import { get } from '@oracly/pm-libs/immutable'
import config from '@config'

import { ERC20 } from '@constants'

export function getAccountByAddress(state, address) {
  const account = get(state, ['bettors', 'accounts', address])
  return account
}

export function getActiveAccountAddress(state) {
  const address = get(state, ['bettors', 'active'])
  return address
}

export function getActiveAccountBalanceERC20(state, erc20) {
  return getActiveAccountBalance(state, ERC20[erc20])
}

export function getActiveAccountBalance(state, currency) {
  const address = getActiveAccountAddress(state)
  const account = getAccountByAddress(state, address)
  const balance = get(account, ['balance', currency, 'amount'])
  return balance
}

export function getActiveAccountGas(state, currency) {
  const address = getActiveAccountAddress(state)
  const account = getAccountByAddress(state, address)
  const gas = get(account, ['gas', 'amount'])
  return gas
}

export function getActiveAccountAllowance(state, currency, target) {
  const address = getActiveAccountAddress(state)
  const account = getAccountByAddress(state, address)

  target = target || config.oraclyv1_address
  const allowance = get(account, ['allowance', currency, target, 'amount'])
  return allowance
}
