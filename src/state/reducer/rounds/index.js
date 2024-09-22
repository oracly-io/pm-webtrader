import { isEmpty, toLower, clone } from 'lodash'
import { success } from '@oracly/pm-libs/redux-cqrs'
import { set, get } from '@oracly/pm-libs/immutable'

import { READ_BLOCKCHAIN_ROUND_BY_ID } from '@actions'
import { READ_BLOCKCHAIN_LATEST_ROUNDS_BY_GAMEID } from '@actions'

import { blockchain2Round, ROUND_BC } from '@state/mappers'

function updateMissing(state, roundids) {
  state = set(state, ['__missing__', 'roundids'], missing => {
    missing = clone(missing || {})

    for (const roundid of roundids) {
      const round = get(state, ['collection', roundid])
      if (isEmpty(round)) missing[roundid] = roundid
      else               delete missing[roundid]
    }

    return missing
  })

  return state
}

function updateGameIdx(state, gameid, outroundids) {

    state = set(state, ['__idx__', 'gameid', gameid], roundids => {
      roundids = clone(roundids)

      for (const outroundid of outroundids) roundids[outroundid] = outroundid

      return roundids
    })

    return state

}

export default {

  metadata: {
    persist: 'short'
  },

  [success(READ_BLOCKCHAIN_LATEST_ROUNDS_BY_GAMEID)]: (state, { gameid, offset, result }) => {
    const [bcroundids, size] = result

    if (isEmpty(bcroundids)) return state
    if (String(size) === '0') return state

    state = updateGameIdx(state, gameid, bcroundids)
    state = updateMissing(state, bcroundids)

    return state
  },

  [success(READ_BLOCKCHAIN_ROUND_BY_ID)]: (state, { roundid, txn, result }) => {
    const [bcround, bcprizefunds, bcbettors, bcpredictions] = result

    const bcroundid = toLower(get(bcround, ROUND_BC.roundid))
    if (isEmpty(bcround) || bcroundid !== roundid) return state

    state = set(state, ['collection', bcroundid], round =>
      blockchain2Round(round, bcround, bcprizefunds, bcbettors, bcpredictions, txn?.blockNumber)
    )

    const bcgameid = toLower(get(bcround, ROUND_BC.gameid))
    state = updateGameIdx(state, bcgameid, [bcroundid])
    state = updateMissing(state, [bcroundid])

    return state

  },

}
