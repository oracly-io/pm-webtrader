import ETH_DARK from './ETH.DARK'
import USDT_DARK from './USDT.DARK'

const CLAIMS = {
  ETH_DARK,
  USDT_DARK,
}

export function factoryClaims(currency, theme = 'DARK') {
  const key = [currency, theme].join('_')
  return CLAIMS[key] || ETH_DARK
}
