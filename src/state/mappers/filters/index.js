import { isEmpty, keys, pickBy } from 'lodash'

import { PRICEFEED, LEVEL_VERSION, ERC20 } from '@constants'

export function toCriterias(filter) {
  if (isEmpty(filter)) return filter

  const where = {
    level: filter.level ? LEVEL_VERSION[filter.level] : LEVEL_VERSION.BRONZE,
    erc20: ERC20.ADDRESS[filter.currency],
    blocked: false,
  }

  let pricefeeds = keys(pickBy(PRICEFEED.CATEGORY, { category: filter.category }))
  if (!isEmpty(pricefeeds)) where.pricefeed_in = pricefeeds

  if (filter.schedule) where.schedule = filter.schedule

  return { where, orderBy: 'schedule', orderDirection: 'asc' }
}

