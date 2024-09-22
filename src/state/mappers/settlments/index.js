import { toDecimalPricefeed } from '@oracly/pm-libs/calc-utils'

export function toSettlmentPair(settlment, pricefeed) {

  if (!settlment) return { settlmentId: null }

  const settlmentId = settlment.settlmentId
  const exitPrice = {
    value: toDecimalPricefeed(settlment.resolutionPrice?.value || settlment.exitPrice?.value, pricefeed),
    timestamp: settlment.resolutionPrice?.timestamp || settlment.exitPrice?.timestamp,
    roundid: settlment.resolutionPrice?.roundid || settlment.exitPrice?.roundid,
  }
  const controlPrice = {
    value: toDecimalPricefeed(settlment.controlPrice?.value, pricefeed),
    timestamp: settlment.controlPrice?.timestamp,
    roundid: settlment.controlPrice?.roundid,
  }

  return {
    settlmentId,
    exitPrice,
    controlPrice,
  }

}
