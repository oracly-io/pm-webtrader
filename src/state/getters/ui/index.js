import { get } from '@oracly/pm-libs/immutable'

import { ERC20 } from '@constants'

export function getGameListIsOpened(state) {
  return get(state, ['ui', 'gameListOpened'])
}

export function getConnectBarIsOpened(state) {
  return get(state, ['ui', 'connectBarOpened'])
}

export function getStatisticsBarIsOpened(state) {
  return get(state, ['ui', 'statisticsBarOpened'])
}

export function getStatisticsBarAccount(state) {
  return get(state, ['ui', 'statisticsBarAccount'])
}

export function getPinedGameIds(state) {
  const currency = getActiveCurrency(state)
  return get(state, ['ui', 'pined', currency])
}

export function isPinedGame(state, gameid) {
  const currency = getActiveCurrency(state)
  return !!get(state, ['ui', 'pined', currency, gameid])
}

export function getActiveGameId(state) {
  const currency = getActiveCurrency(state)
  return get(state, ['ui', 'active', currency])
}

export function isActiveGame(state, gameid) {
  return getActiveGameId(state) === gameid
}

export function getActiveToolbar(state) {
  return get(state, ['ui', 'toolbar'])
}

export function getShowInstallPrompt(state) {
  return get(state, ['ui', 'showInstallPrompt'])
}

export function getFocusRoundId(state) {
  return get(state, ['ui', 'focusround'])
}

export function getActiveCurrency(state) {
  return get(state, ['ui', 'currency'])
}

export function getActiveERC20(state) {
  return ERC20[getActiveCurrency(state)]
}

export function getIsSwapperVisible(state) {
  return get(state, ['ui', 'swapper', 'open'])
}

export function getNetworkModalIsOpened(state) {
  return get(state, ['ui', 'networkModalOpened'])
}