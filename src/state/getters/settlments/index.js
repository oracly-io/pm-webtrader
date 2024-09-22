import { pick, isEmpty, isArray } from 'lodash'
import { get } from '@oracly/pm-libs/immutable'

import { getActiveGamePricefeed } from '@state/getters/games'

export function getSettlments(state) {
  return get(state, ['settlments', 'pricepairs'])
}

export function getSettlmentByRoundid(state, roundid) {
  const settlments = getSettlments(state)
  const settlment = get(settlments, [roundid])

  return settlment
}

export function getSettlmentById(state, pricefeed, settlmentid) {
  if (!pricefeed) return {}
  if (!settlmentid) return {}

  return get(getSettlments(state), [pricefeed, settlmentid])
}

export function getSettlmentsByIds(state, pricefeed, settlmentids) {
  if (!pricefeed) return {}
  if (!isArray(settlmentids) || isEmpty(settlmentids)) return {}

  const stlms = get(getSettlments(state), pricefeed)
  return pick(stlms, settlmentids)
}

export function getSettlmentsByRounds(state, rounds) {

  let stlms = {}
  for (const roundid in rounds) {
    const round = rounds[roundid]
    const settlment = getSettlmentById(state, round.pricefeed, round.endDate)
    if (!isEmpty(settlment)) {
      // NOTE: lodash set acts wierd with numeric keys creating arrays
      // so we are using vanillajs here
      stlms[round.pricefeed] = stlms[round.pricefeed] || {}
      stlms[round.pricefeed][settlment.settlmentId] = settlment
    }
  }

  return stlms
}

export function getActiveGameSettlmentsByIds(state, settlmentids) {
  const pricefeed = getActiveGamePricefeed(state)

  return getSettlmentsByIds(state, pricefeed, settlmentids)

}

export function getMissingSettlments(state) {
  return get(state, ['settlments', '_missing'])
}
