// import { pick, isEmpty } from 'lodash'
import { get } from '@oracly/pm-libs/immutable'

import { getActiveGamePricefeed } from '@state/getters/games'

export function getLatestPrices(state) {
  return get(state, ['pricefeed', 'latestprice'])
}

export function getLatestPriceByPricefeed(state, pricefeed) {
  const latestPrices = getLatestPrices(state)
  return get(latestPrices, [pricefeed])
}

export function getActiveGameLatestPrice(state) {
  const pricefeed = getActiveGamePricefeed(state)
  const latestprice = getLatestPriceByPricefeed(state, pricefeed)

  return latestprice
}

