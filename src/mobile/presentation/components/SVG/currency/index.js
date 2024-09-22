// Paris
import AUD from './AUD'
import CAD from './CAD'
import CHF from './CHF'
import JPY from './JPY'
import USD from './USD'
import ETH from './ETH'
import BTC from './BTC'
import SOL from './SOL'
import MATIC from './MATIC'
import BNB from './BNB'

const CURRENCIES = {
  // fiat
  AUD,
  CAD,
  CHF,
  JPY,
  USD,

  // crypto
  ETH,
  SOL,
  BTC,
  MATIC,
  BNB,
}

const DEF = USD

export function factoryByEvent(base, quote) {
  return [
    CURRENCIES[base] || DEF,
    CURRENCIES[quote] || DEF
  ]
}

export function factoryByCurrency(currency) {
  return CURRENCIES[currency] || DEF
}
