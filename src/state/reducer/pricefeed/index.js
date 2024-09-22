import { last, keys } from 'lodash'
import { toDecimalPricefeed } from '@oracly/pm-libs/calc-utils'
import { success } from '@oracly/pm-libs/redux-cqrs'
import { set, get } from '@oracly/pm-libs/immutable'

import { GET_PRICE_FEED, GET_LATEST_PRICE_FEED } from '@actions'

const updateLatestPrice = (state, { pricefeed, result: { data } }) => {

  const timestamp = last(keys(data))
  const oldtimestamp = get(state, ['latestprice', pricefeed, 'timestamp'])
  if (!oldtimestamp || oldtimestamp < timestamp) {
    const value = toDecimalPricefeed(get(data, [timestamp, '0']), pricefeed)
    state = set(state, ['latestprice', pricefeed], { timestamp, value })
  }

  return state
}

export default {

  [success(GET_PRICE_FEED)]: updateLatestPrice,

  [success(GET_LATEST_PRICE_FEED)]: updateLatestPrice,

}


