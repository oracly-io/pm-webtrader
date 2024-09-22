import { map, isEmpty, filter, uniq, mapValues, isObject, get, toLower } from 'lodash'
import { nowUnixTS } from '@oracly/pm-libs/date-utils'
import { numericHash } from '@oracly/pm-libs/hash-utils'

import config from '@config'
import { PRIZEFUNDS, NETWORK_STATUS } from '@constants'
import { NOCONTEST, DOWN, EQUAL, UNDEFINED, UP } from '@constants'

export function getRoundResolutionBySettlement(round, settlment) {
  return getRoundResolutionByPrice(round, settlment?.exitPrice)
}

export function getRoundResolutionDynamic(round, latestPrice, settlment) {
  if (isEmpty(round) || round.phantom) return UNDEFINED

  if (round.resolved) return round.resolution
  if (isNoContestDynamic(round, latestPrice, settlment)) return NOCONTEST

  const exitPrice = getResolutionPriceDynamic(round, latestPrice, settlment)
  const resolution = getRoundResolutionByPrice(round, exitPrice)

  return resolution
}

function isNoContestDynamic(round, latestPrice, settlment) {
  if (isActualRound(round)) {
    if (nowUnixTS() < round.lockDate) return false
    if (!latestPrice?.timestamp || latestPrice.timestamp < round.lockDate) return false
  }

  if (round.resolved && round.resolution === NOCONTEST) return true

  if (isNoContestEmptyRound(round)) return true

  if (nowUnixTS() >= round.expirationDate) return true

  if (!isHistoricalRound(round, settlment)) return false

  const exitPrice = getResolutionPriceDynamic(round, latestPrice, settlment)
  const resolution = getRoundResolutionByPrice(round, exitPrice)
  if (isNoContestRound(round, resolution)) return true

  return false
}

function getRoundResolutionByPrice(round, exitPrice) {

  if (!exitPrice) return UNDEFINED
  if (exitPrice.value === round.entryPriceValue) return EQUAL
  if (exitPrice.value > round.entryPriceValue) return UP
  if (exitPrice.value < round.entryPriceValue) return DOWN

  return UNDEFINED
}


export function isNoContestEmptyRound(round) {
  if (isEmpty(round)) return null

  const prizefundTotal = round.prizefunds[PRIZEFUNDS.TOTAL]

  return (
    round.prizefunds[PRIZEFUNDS.UP] === prizefundTotal ||
    round.prizefunds[PRIZEFUNDS.EQUAL] === prizefundTotal ||
    round.prizefunds[PRIZEFUNDS.DOWN] === prizefundTotal
  )
}

function isNoContestRound(round, resolution) {
  if (isEmpty(round)) return false
  if (resolution === UNDEFINED) return false

  const prizefundTotal = round.prizefunds[PRIZEFUNDS.TOTAL]
  const prizefundWin = round.prizefunds[resolution]

  return Number(prizefundWin) === 0 || prizefundWin === prizefundTotal
}

function getResolutionPriceDynamic(round, latestPrice, settlment) {

  if (isEmpty(round)) return null

  if (isActualRound(round)) return latestPrice

  const isResolveReady = !round.resolved && !isEmpty(settlment)
  if (isResolveReady) {
    return {
      value: settlment.exitPrice.value,
      timestamp: settlment.exitPrice.timestamp,
    }
  }

  const isResolved = round.resolved && round.exitPriceTimestamp && round.exitPriceValue
  if (isResolved) {
    return {
      value: round.exitPriceValue,
      timestamp: round.exitPriceTimestamp,
    }
  }

  if (round.endDate > latestPrice?.timestamp) return latestPrice

  return null

}

export function isHistoricalRound(round, settlment) {

  if (isEmpty(round)) return false
  if (isActualRound(round)) return false

  return (
    round.resolved ||
    !isEmpty(settlment)
  )
}

export function isActualRound(round) {
  return round?.endDate > nowUnixTS()
}

export function getActualRounds(rounds) {
  return filter(rounds, isActualRound)
}

export function getActualRoundsPricefeeds(rounds) {
  const actualRounds = getActualRounds(rounds)
  return uniq(map(actualRounds, 'pricefeed'))
}

export const isRoundResolvedWithContest = (round) => round.resolved && round.resolution !== NOCONTEST

export function toAccountAvatarUrl(address) {
  return `${config.userdata_ava_url + '/' + numericHash(address) % config.userdata_ava_count}.png`
}

export function blockchain2EntityMap(bcentity, ENTITY_BC_MAP) {
  return mapValues(ENTITY_BC_MAP, (key) => {
    const value = isObject(bcentity) ? get(bcentity, key) : bcentity
    return typeof value === 'string' ? toLower(value) : value
  })
}

export const isios = /iphone|ipad/.test(window.navigator.userAgent.toLowerCase())

export const isinstandalonemode =
  window.matchMedia('(display-mode: standalone)').matches ||
  window.navigator.standalone

export function isAddressBarAtBottom() {
    const userAgent = navigator.userAgent.toLowerCase()
    const isSafari = /safari/.test(userAgent) && !/chrome/.test(userAgent)

    if (isios && isSafari) {
        // Safari on iOS 15+ places the address bar at the bottom by default in portrait mode
        if (window.innerHeight < window.outerHeight) {
            return true  // Likely at the bottom if there's a difference
        }
    }

    // For Android or other cases, you might need different heuristics
    return false // Default assumption for non-iOS or non-Safari cases
}

const checkObsolete = (timestamp) => {
  if (!timestamp) return false
  const age = nowUnixTS() - timestamp
  return !!(age >= config.obsolit_data_limit_age)
}
export function determineNetworkStatus(bcblock, latestprice, isOnline) {
  if (!isOnline) return NETWORK_STATUS.ERROR

  if (checkObsolete(bcblock?.timestamp) || checkObsolete(latestprice?.timestamp)) return NETWORK_STATUS.WARNING

  return NETWORK_STATUS.SUCCESS
}
