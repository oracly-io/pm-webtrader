import { map, filter } from 'lodash'
import { get } from '@oracly/pm-libs/immutable'

import { getActiveGameId } from '@state/getters/ui'
import { getGameListFilter } from '@state/getters/filters'

function getGames(state) {
  return get(state, ['games', 'collection'])
}

export function getGameById(state, gameid) {
  const games = getGames(state)
  return get(games, [gameid])
}

export function getActiveGame(state) {
  return getGameById(state, getActiveGameId(state))
}

export function getGameSchedule(state, gameid) {
  const game = getGameById(state, gameid)
  return get(game, ['schedule'])
}

export function getGameName(state, gameid) {
  const game = getGameById(state, gameid)
  return get(game, ['name'])
}

export function getGameBase(state, gameid) {
  const game = getGameById(state, gameid)
  return get(game, ['base'])
}

export function getGameQuote(state, gameid) {
  const game = getGameById(state, gameid)
  return get(game, ['quote'])
}

export function getActiveGamePricefeed(state) {
  const game = getActiveGame(state)
  return get(game, ['pricefeed'])
}

export function getActiveGameCurrency(state) {
  const game = getActiveGame(state)
  return get(game, ['currency'])
}

export function getActiveGameERC20(state) {
  const game = getActiveGame(state)
  return get(game, ['erc20'])
}

export function getGameIdsByListName(state, listname) {
  return get(state, ['games', 'list', listname])
}

export function getGameListIds(state) {
  const search = getGameListFilter(state)
  const games = getGames(state)

  let result = games
  if (search.level) result = filter(result, { level: search.level })
  if (search.currency) result = filter(result, { currency: search.currency })
  if (search.schedule) result = filter(result, { schedule: search.schedule })

  return map(result, 'gameid')

}
