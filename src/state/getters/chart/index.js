import { getActiveGame } from '@state/getters/games'
import { get } from '@oracly/pm-libs/immutable'

export function getChartData(state) {
  return get(state, ['chart', 'chartdata'])
}

export function getActiveGameChartData(state) {
  const game = getActiveGame(state)
  const chartdata = getChartData(state)
  const result = get(chartdata, [game?.pricefeed])

  return result
}

export function getActiveGameChartDateLatestPrice(state) {
  const game = getActiveGame(state)
  const result = get(state, ['chart', 'latest', game?.pricefeed])

  return result
}

export function getIsChartUnstickNow(state) {
  return get(state, ['chart', 'sticknow']) === false
}

export function getChartTimeframeReset(state) {
  return get(state, ['chart', 'timeframereset'])
}
