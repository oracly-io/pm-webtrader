import config from '@config'
import { set } from '@oracly/pm-libs/immutable'

import { BRONZE, USDC } from '@constants'

import {
  SET_GAME_LIST_FILTER_CATEGORY,
  SET_GAME_LIST_FILTER_SCHEDULE,
  SET_GAME_LIST_FILTER_CURRENCY,
  SET_GAME_LIST_FILTER_LEVEL,
  SET_CURRENCY,
} from '@state/actions'


export default {

  metadata: {
    default: {
      level: BRONZE,
      category: null,
      schedule: null,
      currency: config.default_currency || USDC,
    },
		persist: 'long'
  },

  [SET_CURRENCY]: (state, { currency }) => {

    return set(state, ['currency'], currency)

  },

  [SET_GAME_LIST_FILTER_CATEGORY]: (state, { category }) => {

    return set(state, ['category'], category)

  },

  [SET_GAME_LIST_FILTER_SCHEDULE]: (state, { schedule }) => {

    return set(state, ['schedule'], schedule)

  },

  [SET_GAME_LIST_FILTER_LEVEL]: (state, { level }) => {

    return set(state, ['level'], level)

  },

  [SET_GAME_LIST_FILTER_CURRENCY]: (state, { currency }) => {

    return set(state, ['currency'], currency)

  },

}
