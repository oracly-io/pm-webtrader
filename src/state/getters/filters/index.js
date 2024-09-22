import { get } from '@oracly/pm-libs/immutable'

export function getGameListFilter(state) {
  return get(state, ['filters'])
}

export function getGameListFilterPricefeedCategory(state) {
  const filter = getGameListFilter(state)
  return get(filter, ['category'])
}

export function getGameListFilterSchedule(state) {
  const filter = getGameListFilter(state)
  return get(filter, ['schedule'])
}

export function getGameListFilterCurrency(state) {
  const filter = getGameListFilter(state)
  return get(filter, ['currency'])
}

export function getGameListFilterLevel(state) {
  const filter = getGameListFilter(state)
  return get(filter, ['level'])
}
