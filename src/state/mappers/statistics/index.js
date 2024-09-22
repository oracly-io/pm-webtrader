import { curryRight } from 'lodash'

import { blockchain2EntityMap } from '@utils'

export const MENTOR_BC = {
  'id'          : '0',
  'mentorid'    : '0',
  'circle'      : '1',
  'createdAt'   : '4',
  'updatedAt'   : '5',
}
export const blockchain2MentorMap = curryRight(blockchain2EntityMap)(MENTOR_BC)

export const MENTOR_FUND_BC = {
  'earned'     : '2',
  'claimed'    : '3',
}
export const blockchain2MentorFundMap = curryRight(blockchain2EntityMap)(MENTOR_FUND_BC)

export const BC_EPOCH_MAP = {
  'id'        : '0.0',
  'epochid'   : '0.0',
  'startDate' : '0.1',
  'endDate'   : '0.2',
  'startedAt' : '0.3',
  'endedAt'   : '0.4',
  'stakes'    : '1.0',
  'stakefund' : '2.0',
}
export const blockchain2EpochMap = curryRight(blockchain2EntityMap)(BC_EPOCH_MAP)

export const DEPOSIT_BC = {
  'id'            : '0',
  'depositid'     : '0',
  'staker'        : '1',
  'epochStaked'   : '2', // inEpochid
  'stakedAt'      : '3', // createdAt
  'stake'         : '4', // amount
  'epochUnstaked' : '5', // outEpochid
  'unstaked'      : '6',
  'withdrawn'     : '7',
  'withdrawnAt'   : '8',
}

export const blockchain2DepositMap = curryRight(blockchain2EntityMap)(DEPOSIT_BC)