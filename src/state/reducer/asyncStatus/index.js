import { combine } from '@state/reducer/utils'
import { reducer } from '@state/async'
import { toPredictionId } from '@state/mappers'

import {
  PLACE_PREDICTION,
  GET_GAMES,
  WALLET_CONNECT,
  GET_PRICE_FEED,
  GET_CHAT_CHANNELS,
  APPROVE_ACCOUNT_ALLOWANCE,
  WITHDRAW,
  GET_BALANCE,
  MINT_DEMO_1000,
  RESOLVE_WITHDRAW,
  RESOLVE_WITHDRAW_NOCONTEST,
  REQUEST_AUTHENTICATION_PSIG,
  JOIN_MENTOR,

  SWAP_NATIVE_ERC20,

  READ_BLOCKCHAIN_ROUND_BY_ID,
  READ_BLOCKCHAIN_LATEST_PREDICTIONS_BY_ADDRESS,
  READ_BLOCKCHAIN_LATEST_ROUNDS_BY_GAMEID,
  READ_BLOCKCHAIN_LATEST_PREDICTIONS_BY_ROUNDID,

  GET_BLOCKCHAIN_MENTOR_STATISTICS,
  GET_BLOCKCHAIN_STAKER_JOINED_STATISTICS,
  GET_BLOCKCHAIN_STAKER_PAIDOUT_STATISTICS,
  GET_BLOCKCHAIN_STAKER_LAST_ACTIVITY_STATISTICS,
  GET_BLOCKCHAIN_STAKER_STAKE_STATISTICS,
  GET_BLOCKCHAIN_BETTOR_STATISTICS,
  GET_BLOCKCHAIN_BETTOR_JOINED_STATISTICS,
  GET_BLOCKCHAIN_BETTOR_LAST_ACTIVITY_STATISTICS,
  GET_BLOCKCHAIN_STAKING_ACTUAL_EPOCH_STATISTICS,
  GET_BLOCKCHAIN_STAKING_ACTUAL_EPOCH_ID,
  GET_CHAT_CHANNEL_ONLINE,
} from '@state/actions'

export default combine({
  [MINT_DEMO_1000]: reducer(MINT_DEMO_1000),
  [GET_BALANCE]: reducer(GET_BALANCE, ({ account }) => account),

  [GET_PRICE_FEED]: reducer(GET_PRICE_FEED, ({ pricefeed }) => pricefeed),

  [GET_GAMES]: reducer(GET_GAMES),
  [APPROVE_ACCOUNT_ALLOWANCE]: reducer(APPROVE_ACCOUNT_ALLOWANCE, ({ erc20 }) => erc20),
  [GET_CHAT_CHANNELS]: reducer(GET_CHAT_CHANNELS),

  // Wallet Interactions
  [WITHDRAW]: reducer(WITHDRAW, ({ predictionid }) => predictionid),
  [RESOLVE_WITHDRAW]: reducer(RESOLVE_WITHDRAW, ({ predictionid }) => predictionid),
  [RESOLVE_WITHDRAW_NOCONTEST]: reducer(RESOLVE_WITHDRAW_NOCONTEST, ({ predictionid }) => predictionid),
  [WALLET_CONNECT]: reducer(WALLET_CONNECT),
  [JOIN_MENTOR]: reducer(JOIN_MENTOR, ({ mentorid }) => mentorid),
  [PLACE_PREDICTION]: reducer(PLACE_PREDICTION, (args) => toPredictionId(args)),
  [REQUEST_AUTHENTICATION_PSIG]: reducer(REQUEST_AUTHENTICATION_PSIG, ({ from }) => from),

  // Uniswap V3
  [SWAP_NATIVE_ERC20]: reducer(SWAP_NATIVE_ERC20, ({ swapid }) => swapid),

  // Oracly V1
  [READ_BLOCKCHAIN_LATEST_PREDICTIONS_BY_ADDRESS]: reducer(READ_BLOCKCHAIN_LATEST_PREDICTIONS_BY_ADDRESS, ({ loadType, address }) =>
    [[address, loadType].filter(i => i).join('.'), address]
  ),
  [READ_BLOCKCHAIN_LATEST_PREDICTIONS_BY_ROUNDID]: reducer(READ_BLOCKCHAIN_LATEST_PREDICTIONS_BY_ROUNDID, ({ loadType, roundid }) =>
    [[roundid, loadType].filter(i => i).join('.'), roundid]
  ),
  [READ_BLOCKCHAIN_ROUND_BY_ID]: reducer(READ_BLOCKCHAIN_ROUND_BY_ID, ({ roundid }) => roundid),
  [READ_BLOCKCHAIN_LATEST_ROUNDS_BY_GAMEID]: reducer(READ_BLOCKCHAIN_LATEST_ROUNDS_BY_GAMEID, ({ gameid }) => gameid),

  [GET_BLOCKCHAIN_BETTOR_STATISTICS]: reducer(GET_BLOCKCHAIN_BETTOR_STATISTICS, ({ loadType, bettorid }) =>
    [bettorid, loadType].filter(i => i).join('.')
  ),
  [GET_BLOCKCHAIN_BETTOR_LAST_ACTIVITY_STATISTICS]: reducer(GET_BLOCKCHAIN_BETTOR_LAST_ACTIVITY_STATISTICS, ({ loadType, bettorid }) =>
    [bettorid, loadType].filter(i => i).join('.')
  ),
  [GET_BLOCKCHAIN_BETTOR_JOINED_STATISTICS]: reducer(GET_BLOCKCHAIN_BETTOR_JOINED_STATISTICS, ({ loadType, bettorid }) =>
    [bettorid, loadType].filter(i => i).join('.')
  ),
  [GET_BLOCKCHAIN_STAKER_STAKE_STATISTICS]: reducer(GET_BLOCKCHAIN_STAKER_STAKE_STATISTICS, ({ loadType, stakerid }) =>
    [stakerid, loadType].filter(i => i).join('.')
  ),
  [GET_BLOCKCHAIN_STAKER_LAST_ACTIVITY_STATISTICS]: reducer(GET_BLOCKCHAIN_STAKER_LAST_ACTIVITY_STATISTICS, ({ loadType, stakerid }) =>
    [stakerid, loadType].filter(i => i).join('.')
  ),
  [GET_BLOCKCHAIN_STAKER_PAIDOUT_STATISTICS]: reducer(GET_BLOCKCHAIN_STAKER_PAIDOUT_STATISTICS, ({ loadType, stakerid }) =>
    [stakerid, loadType].filter(i => i).join('.')
  ),
  [GET_BLOCKCHAIN_STAKER_JOINED_STATISTICS]: reducer(GET_BLOCKCHAIN_STAKER_JOINED_STATISTICS, ({ loadType, stakerid }) =>
    [stakerid, loadType].filter(i => i).join('.')
  ),
  [GET_BLOCKCHAIN_MENTOR_STATISTICS]: reducer(GET_BLOCKCHAIN_MENTOR_STATISTICS, ({ loadType, mentorid }) =>
    [mentorid, loadType].filter(i => i).join('.')
  ),
  [GET_BLOCKCHAIN_STAKING_ACTUAL_EPOCH_ID]: reducer(GET_BLOCKCHAIN_STAKING_ACTUAL_EPOCH_ID,  ({ loadType }) => loadType),
  [GET_BLOCKCHAIN_STAKING_ACTUAL_EPOCH_STATISTICS]: reducer(GET_BLOCKCHAIN_STAKING_ACTUAL_EPOCH_STATISTICS,  ({ loadType }) => loadType),
  [GET_CHAT_CHANNEL_ONLINE]: reducer(GET_CHAT_CHANNEL_ONLINE,  ({ channel, loadType }) => [channel, loadType].filter(i => i).join('.')),
})
