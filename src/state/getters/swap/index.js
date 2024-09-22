import config from '@config'
import { get } from '@oracly/pm-libs/immutable'

import { getActiveERC20 } from '@state/getters/ui'

export function getActiveSwap(state) {
  const active = get(state, ['swap', getActiveERC20(state)])
  if (!active) return active

  const age = (Date.now() - active.timestamp)
  if (age < config.swap_timeout) return active
}

export function getActiveSwapPool(state) {
  const swap = getActiveSwap(state)
  return get(swap, ['pool'])

}

export function getActiveSwapQuote(state) {
  const swap = getActiveSwap(state)
  return get(swap, ['quote'])
}

