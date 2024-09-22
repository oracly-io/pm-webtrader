import { ERC20 } from '@constants/erc20'
import { PRICEFEED } from '@constants/pricefeed'
import { UNIX_MINUTE, UNIX_DAY } from '@constants/unixdate'

export const GAME_DEFAULTS = [
  /// DEMO
  // Bronze
  {
    pricefeed: PRICEFEED.BTC_USD, //0xc907e116054ad103354f2d350fd2514433d57f6f
    erc20: ERC20.DEMO, //0x387920cbc6e3a3e054a791c74c8160bbc016fdf4
    positioning: UNIX_MINUTE, //60
    schedule: 2*UNIX_MINUTE, //120
    expiration: UNIX_DAY, //86400
    version: 1,
    minWager: 1 * 10**ERC20.DECIMALS.DEMO
  },
  {
    pricefeed: PRICEFEED.BTC_USD,
    erc20: ERC20.DEMO,
    positioning: UNIX_MINUTE,
    schedule: 3*UNIX_MINUTE,
    expiration: UNIX_DAY,
    version: 1,
    minWager: 1 * 10**ERC20.DECIMALS.DEMO
  },
  {
    pricefeed: PRICEFEED.BTC_USD,
    erc20: ERC20.DEMO,
    positioning: UNIX_MINUTE,
    schedule: 4*UNIX_MINUTE,
    expiration: UNIX_DAY,
    version: 1,
    minWager: 1 * 10**ERC20.DECIMALS.DEMO
  },
  {
    pricefeed: PRICEFEED.BTC_USD,
    erc20: ERC20.DEMO,
    positioning: UNIX_MINUTE,
    schedule: 6*UNIX_MINUTE,
    expiration: UNIX_DAY,
    version: 1,
    minWager: 1 * 10**ERC20.DECIMALS.DEMO
  },

  // Silver
  {
    pricefeed: PRICEFEED.BTC_USD,
    erc20: ERC20.DEMO,
    positioning: UNIX_MINUTE,
    schedule: 2*UNIX_MINUTE,
    expiration: UNIX_DAY,
    version: 2,
    minWager: 10 * 10**ERC20.DECIMALS.DEMO
  },
  {
    pricefeed: PRICEFEED.BTC_USD,
    erc20: ERC20.DEMO,
    positioning: UNIX_MINUTE,
    schedule: 3*UNIX_MINUTE,
    expiration: UNIX_DAY,
    version: 2,
    minWager: 10 * 10**ERC20.DECIMALS.DEMO
  },
  {
    pricefeed: PRICEFEED.BTC_USD,
    erc20: ERC20.DEMO,
    positioning: UNIX_MINUTE,
    schedule: 4*UNIX_MINUTE,
    expiration: UNIX_DAY,
    version: 2,
    minWager: 10 * 10**ERC20.DECIMALS.DEMO
  },
  {
    pricefeed: PRICEFEED.BTC_USD,
    erc20: ERC20.DEMO,
    positioning: UNIX_MINUTE,
    schedule: 6*UNIX_MINUTE,
    expiration: UNIX_DAY,
    version: 2,
    minWager: 10 * 10**ERC20.DECIMALS.DEMO
  },

  // Gold
  {
    pricefeed: PRICEFEED.BTC_USD,
    erc20: ERC20.DEMO,
    positioning: UNIX_MINUTE,
    schedule: 2*UNIX_MINUTE,
    expiration: UNIX_DAY,
    version: 3,
    minWager: 100 * 10**ERC20.DECIMALS.DEMO
  },
  {
    pricefeed: PRICEFEED.BTC_USD,
    erc20: ERC20.DEMO,
    positioning: UNIX_MINUTE,
    schedule: 3*UNIX_MINUTE,
    expiration: UNIX_DAY,
    version: 3,
    minWager: 100 * 10**ERC20.DECIMALS.DEMO
  },
  {
    pricefeed: PRICEFEED.BTC_USD,
    erc20: ERC20.DEMO,
    positioning: UNIX_MINUTE,
    schedule: 4*UNIX_MINUTE,
    expiration: UNIX_DAY,
    version: 3,
    minWager: 100 * 10**ERC20.DECIMALS.DEMO
  },
  {
    pricefeed: PRICEFEED.BTC_USD,
    erc20: ERC20.DEMO,
    positioning: UNIX_MINUTE,
    schedule: 6*UNIX_MINUTE,
    expiration: UNIX_DAY,
    version: 3,
    minWager: 100 * 10**ERC20.DECIMALS.DEMO
  },

  /// USDC
  // Bronze
  {
    pricefeed: PRICEFEED.BTC_USD, //0xc907e116054ad103354f2d350fd2514433d57f6f
    erc20: ERC20.USDC, //0x2791bca1f2de4661ed88a30c99a7a9449aa84174
    positioning: UNIX_MINUTE, //60
    schedule: 2*UNIX_MINUTE, //120
    expiration: UNIX_DAY, //86400
    version: 1,
    minWager: 1 * 10**ERC20.DECIMALS.USDC
  },
  {
    pricefeed: PRICEFEED.BTC_USD,
    erc20: ERC20.USDC,
    positioning: UNIX_MINUTE,
    schedule: 3*UNIX_MINUTE,
    expiration: UNIX_DAY,
    version: 1,
    minWager: 1 * 10**ERC20.DECIMALS.USDC
  },
  {
    pricefeed: PRICEFEED.BTC_USD,
    erc20: ERC20.USDC,
    positioning: UNIX_MINUTE,
    schedule: 4*UNIX_MINUTE,
    expiration: UNIX_DAY,
    version: 1,
    minWager: 1 * 10**ERC20.DECIMALS.USDC
  },
  {
    pricefeed: PRICEFEED.BTC_USD,
    erc20: ERC20.USDC,
    positioning: UNIX_MINUTE,
    schedule: 6*UNIX_MINUTE,
    expiration: UNIX_DAY,
    version: 1,
    minWager: 1 * 10**ERC20.DECIMALS.USDC
  },

  // Silver
  {
    pricefeed: PRICEFEED.BTC_USD,
    erc20: ERC20.USDC,
    positioning: UNIX_MINUTE,
    schedule: 2*UNIX_MINUTE,
    expiration: UNIX_DAY,
    version: 2,
    minWager: 10 * 10**ERC20.DECIMALS.USDC
  },
  {
    pricefeed: PRICEFEED.BTC_USD,
    erc20: ERC20.USDC,
    positioning: UNIX_MINUTE,
    schedule: 3*UNIX_MINUTE,
    expiration: UNIX_DAY,
    version: 2,
    minWager: 10 * 10**ERC20.DECIMALS.USDC
  },
  {
    pricefeed: PRICEFEED.BTC_USD,
    erc20: ERC20.USDC,
    positioning: UNIX_MINUTE,
    schedule: 4*UNIX_MINUTE,
    expiration: UNIX_DAY,
    version: 2,
    minWager: 10 * 10**ERC20.DECIMALS.USDC
  },
  {
    pricefeed: PRICEFEED.BTC_USD,
    erc20: ERC20.USDC,
    positioning: UNIX_MINUTE,
    schedule: 6*UNIX_MINUTE,
    expiration: UNIX_DAY,
    version: 2,
    minWager: 10 * 10**ERC20.DECIMALS.USDC
  },

  // Gold
  {
    pricefeed: PRICEFEED.BTC_USD,
    erc20: ERC20.USDC,
    positioning: UNIX_MINUTE,
    schedule: 2*UNIX_MINUTE,
    expiration: UNIX_DAY,
    version: 3,
    minWager: 100 * 10**ERC20.DECIMALS.USDC
  },
  {
    pricefeed: PRICEFEED.BTC_USD,
    erc20: ERC20.USDC,
    positioning: UNIX_MINUTE,
    schedule: 3*UNIX_MINUTE,
    expiration: UNIX_DAY,
    version: 3,
    minWager: 100 * 10**ERC20.DECIMALS.USDC
  },
  {
    pricefeed: PRICEFEED.BTC_USD,
    erc20: ERC20.USDC,
    positioning: UNIX_MINUTE,
    schedule: 4*UNIX_MINUTE,
    expiration: UNIX_DAY,
    version: 3,
    minWager: 100 * 10**ERC20.DECIMALS.USDC
  },
  {
    pricefeed: PRICEFEED.BTC_USD,
    erc20: ERC20.USDC,
    positioning: UNIX_MINUTE,
    schedule: 6*UNIX_MINUTE,
    expiration: UNIX_DAY,
    version: 3,
    minWager: 100 * 10**ERC20.DECIMALS.USDC
  },
]

