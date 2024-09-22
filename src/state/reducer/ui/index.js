import { compact, isEmpty, find, orderBy } from 'lodash'
import { isDesktopEnv } from '@oracly/pm-libs/env-utils'
import { success } from '@oracly/pm-libs/redux-cqrs'
import { set, get, del } from '@oracly/pm-libs/immutable'

import config from '@config'

import { PIN_GAME, UNPIN_GAME, SET_ACTIVE_GAME } from '@actions'
import { SET_SHOW_GAMES_LIST, SET_SHOW_CONNECT_BAR } from '@actions'
import { TOGGLE_TOOLBAR, SET_SHOW_STATISTICS_BAR } from '@actions'
import { FOCUS_ROUND, UNFOCUS_ROUND } from '@actions'
import { GET_GAMES, SET_CURRENCY } from '@actions'
import { SHOW_INSTALL_PROMPT } from '@actions'
import { SET_NETWORK_MODAL_OPEN } from '@actions'

import { BTC_USD, USDC } from '@constants'
import { TOOLBAR_ROUND } from '@constants'

// import { toGame } from '@state/mappers'

export default {
  metadata: {
    persist: 'long',
    default: {
      toolbar: isDesktopEnv(config) ? TOOLBAR_ROUND : null,
      currency: config.default_currency || USDC,
      showInstallPrompt: true,
    },
  },

  [SHOW_INSTALL_PROMPT]: (
    state, { showInstallPrompt }
  ) => {
    state = set(state, ['showInstallPrompt'], showInstallPrompt)

    return state
  },
  [SET_CURRENCY]: (state, { currency }) => {
    state = set(state, ['currency'], currency)
    state = del(state, ['focusround'])

    return state
  },

  [SET_SHOW_GAMES_LIST]: (state, { isOpened }) => {
    return set(state, ['gameListOpened'], isOpened)
  },

  [SET_SHOW_CONNECT_BAR]: (state, { isOpened }) => {
    return set(state, ['connectBarOpened'], isOpened)
  },

  [SET_SHOW_STATISTICS_BAR]: (state, { isOpened, account }) => {
    state = set(state, ['statisticsBarOpened'], isOpened)
    if (account) state = set(state, ['statisticsBarAccount'], account)

    return state
  },

  [PIN_GAME]: (state, { gameid }) => {
    const currency = get(state, ['currency'])
    state = set(state, ['active', currency], gameid)
    state = set(state, ['pined', currency, gameid], gameid)

    return state
  },

  [UNPIN_GAME]: (state, { gameid }) => {
    const currency = get(state, ['currency'])
    return del(state, ['pined', currency, gameid])
  },

  [SET_ACTIVE_GAME]: (state, { gameid }) => {
    const currency = get(state, ['currency'])
    state = set(state, ['active', currency], gameid)
    return state
  },

  [TOGGLE_TOOLBAR]: (state, { type }) => {
    return set(state, ['toolbar'], (existing) =>
      existing !== type ? type : null
    )
  },

  [FOCUS_ROUND]: (state, { roundid }) => {
    return set(state, ['focusround'], roundid)
  },

  [UNFOCUS_ROUND]: (state, { roundid }) => {
    const poproundid = get(state, ['focusround'])
    if (poproundid !== roundid) return state

    return del(state, ['focusround'])
  },

  [success(GET_GAMES)]: (state, { hash, result }) => {
    let games = compact(get(result, ['data', 'games']))
    if (isEmpty(games)) return state

    const currency = get(state, ['currency'])
    if (!isEmpty(games) && !get(state, ['active', currency])) {
      games = orderBy(games, ['schedule'])
      const dbgame =
        find(games, { pricefeed: BTC_USD }) || find(games, 'gameid')
      const gameid = dbgame?.gameid

      if (!isEmpty(gameid)) {
        state = set(state, ['active', currency], gameid)
        state = set(state, ['pined', currency, gameid], gameid)
      }
    }

    return state
  },

  [SET_NETWORK_MODAL_OPEN]: (state, { isOpened }) => {

    state = set(state, ['networkModalOpened'], isOpened)

    return state
  },
}
