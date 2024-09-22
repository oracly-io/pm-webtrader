import { curryRight } from 'lodash'

import { blockchain2EntityMap } from '@utils'

export const BETTOR_BC = {
  'id'               : '0',
  'predictionsTotal' : '1.0',
  'depositTotal'     : '2.0',
  'paidoutTotal'     : '3.0',
}
export const blockchain2BettorMap = curryRight(blockchain2EntityMap)(BETTOR_BC)