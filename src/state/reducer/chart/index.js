import { toDecimalPricefeed } from '@oracly/pm-libs/calc-utils'
import { fromDecimalPricefeed } from '@oracly/pm-libs/calc-utils'
import { success } from '@oracly/pm-libs/redux-cqrs'
import { set, get } from '@oracly/pm-libs/immutable'

import { compact, isEmpty, toLower } from 'lodash'

import { TIMEFRAME_RESET, GET_SETTLEMENTS_BY_IDS } from '@actions'
import { GET_PRICE_FEED, READ_BLOCKCHAIN_ROUND_BY_ID } from '@actions'
import { TIMEFRAME_NOW_STICK, TIMEFRAME_NOW_UNSTICK } from '@actions'
import { toSettlmentPair, ROUND_BC } from '@state/mappers'

function addPrices(state, pricefeed, data) {

  if (!pricefeed || isEmpty(data)) return state

  let latestTS = 0
  state = set(state, ['chartdata', pricefeed], feed => {
    for (const ts in data) {

      const value = get(data, [ts, '0'])

      feed[ts] = toDecimalPricefeed(value, pricefeed)

      if (latestTS < ts) latestTS = ts
    }
    return feed
  })

  const oldlatest = get(state, ['latest', pricefeed])
  if (!oldlatest || oldlatest.timestamp < latestTS) {
    state = set(state, ['latest', pricefeed], {
      timestamp: latestTS,
      value: get(state, ['chartdata', pricefeed, latestTS])
    })
  }

  return state
}

export default {

  [success(GET_PRICE_FEED)]: (state, { pricefeed, result: { data } }) => {
    return addPrices(state, pricefeed, data)
  },

  [success(READ_BLOCKCHAIN_ROUND_BY_ID)]: (state, { roundid, result }) => {
    const [bcround] = result

    const bcroundid = toLower(get(bcround, ROUND_BC.roundid))
    if (isEmpty(bcround) || bcroundid !== roundid) return state

    const pricefeed = toLower(get(bcround, ROUND_BC.pricefeed))
    const entryPriceTimestamp = Number(get(bcround, ROUND_BC.entryPrice.timestamp))
    const entryPriceValue = Number(get(bcround, ROUND_BC.entryPrice.value))

    if (pricefeed && entryPriceTimestamp && entryPriceValue) {
      state = addPrices(state, pricefeed, { [entryPriceTimestamp]: [entryPriceValue] })
    }

    return state
  },

  [success(GET_SETTLEMENTS_BY_IDS)]: (state, { pricefeed, result }) => {
    const settlments = compact(get(result, ['data']))

    const prices = settlments.reduce((acc, settlment) => {
      settlment = toSettlmentPair(settlment, pricefeed)
      acc[settlment.exitPrice.timestamp] = [fromDecimalPricefeed(settlment.exitPrice.value, pricefeed)]
      return acc
    }, {})

    if (!isEmpty(prices)) state = addPrices(state, pricefeed, prices)

    return state

  },

  [TIMEFRAME_NOW_STICK]: (state) => {

    return set(state, ['sticknow'], true)

  },

  [TIMEFRAME_NOW_UNSTICK]: (state) => {

    return set(state, ['sticknow'], false)

  },

  [TIMEFRAME_RESET]: (state, { needreset }) => {

    return set(state, ['timeframereset'], needreset)

  },

}

