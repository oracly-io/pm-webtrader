import { rootReducer, combine } from '@state/reducer/utils'

import notifications from './notifications'
import application from './application'
import asyncStatus from './asyncStatus'
import predictions from './predictions'
import settlments from './settlments'
import statistics from './statistics'
import blockchain from './blockchain'
import pricefeed from './pricefeed'
import filters from './filters'
import bettors from './bettors'
import rounds from './rounds'
import games from './games'
import chart from './chart'
import chats from './chats'
import users from './users'
import auth from './auth'
import swap from './swap'
import ui from './ui'

const rootCombination = combine({
  notifications,
  application,
  asyncStatus,
  predictions,
  settlments,
  statistics,
  blockchain,
  pricefeed,
  filters,
  bettors,
  rounds,
  games,
  chart,
  chats,
  users,
  auth,
  swap,
  ui,
})

export default rootReducer(rootCombination)
