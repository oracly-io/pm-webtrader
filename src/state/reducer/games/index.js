import { compact, orderBy, get } from 'lodash'
import { success } from '@oracly/pm-libs/redux-cqrs'
import { set } from '@oracly/pm-libs/immutable'

import { GET_GAMES }from '@state/actions'

import { toGame } from '@state/mappers'

export default {

  metadata: {
    persist: 'short'
  },

  [success(GET_GAMES)]: (state, { listname, result }) => {
    let games = get(result, ['data', 'games'])
    games = compact(games)
    games = orderBy(games, ['erc20', 'pricefeed', 'schedule'], ['desc', 'asc'])

    const ids = []
    for (const dbgame of games) {
      const game = toGame(dbgame)
      state = set(state, ['collection', game.gameid], game)
      ids.push(game.gameid)
    }
    state = set(state, ['list', listname], ids)

    return state

  },

}
