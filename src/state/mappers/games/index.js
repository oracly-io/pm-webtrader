import { isEmpty } from 'lodash'
import { toDecimalERC20 } from '@oracly/pm-libs/calc-utils'
import { keccak256 } from '@oracly/pm-libs/hash-utils'

import { LEVEL_VERSION } from '@constants'
import { ERC20 } from '@constants'
import { PRICEFEED } from '@constants'


export function toGame(dbgame) {
  if (isEmpty(dbgame)) return dbgame

  dbgame = { ...dbgame }

  dbgame.gameid = dbgame.gameid || toGameId(dbgame)

  dbgame.schedule = dbgame.schedule && Number(dbgame.schedule)
  dbgame.positioning = dbgame.positioning && Number(dbgame.positioning)

  const base = PRICEFEED.BASE[dbgame.pricefeed]
  const quote = PRICEFEED.QUOTE[dbgame.pricefeed]

  dbgame.base = base
  dbgame.quote = quote

  dbgame.name = [base, quote].join('/')

  dbgame.level = LEVEL_VERSION[dbgame.version % 1000]
  dbgame.currency = ERC20[dbgame.erc20]

  dbgame.minWager = toDecimalERC20(dbgame.minWager, dbgame.erc20)

  return dbgame

}

export function toGameId(mtp) {
  return keccak256(
    [
      mtp.pricefeed,
      mtp.erc20,
      mtp.version,
      mtp.schedule,
      mtp.positioning,
    ],
    [
      'address',
      'address',
      'uint16',
      'uint256',
      'uint256',
    ]
  )
}
