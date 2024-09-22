import UNKNOWN_DARK from './USDC.DARK'
import ETH_DARK from './ETH.DARK'
// import ORCY_DARK from './ORCY.DARK'
import USDT_DARK from './USDT.DARK'
import USDC_DARK from './USDC.DARK'
import DEMO_DARK from './DEMO.DARK'

const FUNDS = {
  UNKNOWN_DARK,

  ETH_DARK,
  // ORCY_DARK,
  DEMO_DARK,
  USDT_DARK,
  USDC_DARK,
}

export function factoryFunds(currency, theme = 'DARK') {
  const key = [currency, theme].join('_')

  return FUNDS[key] || UNKNOWN_DARK
}
