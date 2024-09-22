import { compact, toLower, isEmpty } from 'lodash'
import { success } from '@oracly/pm-libs/redux-cqrs'
import { get, set, del } from '@oracly/pm-libs/immutable'

import { NOCONTEST } from '@constants'
import { GET_SETTLEMENTS_BY_IDS, READ_BLOCKCHAIN_ROUND_BY_ID } from '@actions'

import { blockchain2Round, toSettlmentPair, ROUND_BC } from '@state/mappers'

const addMissingSettlments = (state, rounds) => {
  rounds = compact(rounds)
  for (const round of rounds) {
    if (round.resolved && round.resolution !== NOCONTEST) continue

    const settlment = get(state, ['pricepairs', round.pricefeed, round.endDate])
    if (!isEmpty(settlment)) continue

    const settlmentId = round.endDate
    state = set(state, ['_missing', round.pricefeed, settlmentId], settlmentId)
  }

  return state
}

const deleteMissingSettlments = (state, pricefeed, settlments) => {

  for (const settlment of settlments) {
    state = del(state, ['_missing', pricefeed, settlment.settlmentId])
  }

  return state
}

export default {

  metadata: {
    persist: 'short'
  },

  [success(GET_SETTLEMENTS_BY_IDS)]: (state, { pricefeed, result }) => {
    const settlments = compact(get(result, ['data']))

    state = deleteMissingSettlments(state, pricefeed, settlments)

    state = set(state, ['pricepairs', pricefeed],
      stlms => {
        for (const settlment of settlments) {
          const stl = toSettlmentPair(settlment, pricefeed)
          stlms[stl.settlmentId] = stl
        }
        return stlms
      }
    )

    return state

  },

  [success(READ_BLOCKCHAIN_ROUND_BY_ID)]: (state, { roundid, txn, result }) => {
    const [bcround, bcprizefunds, bcbettors, bcpredictions] = result

    const bcroundid = toLower(get(bcround, ROUND_BC.roundid))
    if (isEmpty(bcround) || bcroundid !== roundid) return state

    const round = blockchain2Round({}, bcround, bcprizefunds, bcbettors, bcpredictions, txn?.blockNumber)

    state = addMissingSettlments(state, [round])

    return state

  },

}

