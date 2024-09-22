import { map, compact, pick, isFunction } from 'lodash'
import { web3client } from '@oracly/pm-libs/crypto-wallet'
import { DEFAULT_WEB3_PROVIDER } from '@oracly/pm-libs/crypto-wallet'
import { nowUnixTS, formatUnixTS } from '@oracly/pm-libs/date-utils'
import { toHex, replace } from '@oracly/pm-libs/hash-utils'

import config from '@config'

import {
  GET_PRICE_FEED,
  GET_LATEST_PRICE_FEED,

  REQUEST_AUTHENTICATION_PSIG,

  PLACE_PREDICTION,
  WITHDRAW,
  RESOLVE_WITHDRAW,
  RESOLVE_WITHDRAW_NOCONTEST,
  RESOLVE,
  RESOLVE_NOCONTEST,
  JOIN_MENTOR,

  READ_BLOCKCHAIN_BLOCK_NUMBER,
  READ_BLOCKCHAIN_ROUND_BY_ID,
  READ_BLOCKCHAIN_PREDICTION_BY_ID,
  READ_BLOCKCHAIN_LATEST_PREDICTIONS_BY_ROUNDID,
  READ_BLOCKCHAIN_LATEST_PREDICTIONS_BY_ADDRESS,
  READ_BLOCKCHAIN_LATEST_ROUNDS_BY_GAMEID,

  READ_BLOCKCHAIN_SWAP_NATIVE_ERC20_POOL,
  READ_BLOCKCHAIN_SWAP_NATIVE_ERC20_QUOTE_EX_IN,
  READ_BLOCKCHAIN_SWAP_NATIVE_ERC20_QUOTE_EX_OUT,

  SWAP_NATIVE_ERC20,

  MINT_DEMO_1000,

  AWAIT_TRANSACTION,
  NOTIFY_ABOUT_FAILED_TRANSACTION,

  GET_GAS_BALANCE,

  GET_BALANCE,
  GET_ALLOWANCE,
  APPROVE_ACCOUNT_ALLOWANCE,


  RESOVLE_ADDRESS_TO_NICKNAME,

  GET_GAMES,

  GET_SETTLEMENTS_BY_IDS,

  CHAT_SEND,
  GET_CHAT_CHANNELS,
  GET_CHAT_CHANNEL_ONLINE,

  GET_BLOCKCHAIN_MENTOR_STATISTICS,
  GET_BLOCKCHAIN_STAKER_STAKE_STATISTICS,
  GET_BLOCKCHAIN_STAKER_PAIDOUT_STATISTICS,
  GET_BLOCKCHAIN_STAKING_ACTUAL_EPOCH_ID,
  GET_BLOCKCHAIN_STAKING_ACTUAL_EPOCH_STATISTICS,
  GET_BLOCKCHAIN_STAKER_LAST_ACTIVITY_STATISTICS,
  GET_BLOCKCHAIN_STAKER_JOINED_STATISTICS,
  GET_BLOCKCHAIN_BETTOR_STATISTICS,
  GET_BLOCKCHAIN_BETTOR_JOINED_STATISTICS,
  GET_BLOCKCHAIN_BETTOR_LAST_ACTIVITY_STATISTICS,

} from '@actions'

import { AUTH } from '@constants'
import { LEVEL_VERSION, GAME_DEFAULTS, ERC20 } from '@constants'

import { ChatApi } from '@oracly/pm-libs/pm-api-client'
import { PriceFeedApi } from '@oracly/pm-libs/pm-api-client'
import { UserApi } from '@oracly/pm-libs/pm-api-client'

import { ChatSocket } from '@oracly/pm-libs/pm-socket-client'
import { swapClient } from '@lib/pm-swap-client'

import OraclyV1 from '@abis/@oracly/OraclyV1.json'
import DEMO from '@abis/@oracly/DEMO.json'
import IERC20 from '@abis/@openzeppelin/IERC20.json'
import MentoringOraclyV1 from '@abis/@oracly/MentoringOraclyV1.json'
import StakingOraclyV1 from '@abis/@oracly/StakingOraclyV1.json'

import { toGameId } from '@state/mappers'
// import { toCriterias } from '@state/mappers'


function bcreadOraclyV1(method, ...params) {
  const [,options] = params
  if (!options.blockTag) delete options.blockTag
  const client = web3client.get(config.oraclyv1_address, OraclyV1.abi, { readonly: true })
  if (isFunction(client[method])) return client[method](...params)
  return Promise.reject('Method Not Found')
}

function bcwriteOraclyV1(method, ...params) {
  const client = web3client.get(config.oraclyv1_address, OraclyV1.abi)
  if (isFunction(client[method])) return client[method](...params)
  return Promise.reject('Method Not Found')
}

function bcwriteDEMO(method, ...params) {
  const client = web3client.get(config.demo_address, DEMO.abi)
  if (isFunction(client[method])) return client[method](...params)
  return Promise.reject('Method Not Found')
}

function bcreadERC(method, erc20, ...params) {
  const [,options] = params
  if (!options.blockTag) delete options.blockTag
  const client = web3client.get(erc20, IERC20.abi, { readonly: true })
  if (isFunction(client[method])) return client[method](...params)
  return Promise.reject('Method Not Found')
}

function bcwriteERC(method, erc20, ...params) {
  const client = web3client.get(erc20, IERC20.abi)
  if (isFunction(client[method])) return client[method](...params)
  return Promise.reject('Method Not Found')
}

function bcreadST(method, ...params) {
  const [,options = {}] = params
  if (!options.blockTag) delete options.blockTag
  const client = web3client.get(config.staking_address, StakingOraclyV1.abi, { readonly: true })
  if (isFunction(client[method])) return client[method](...params)
  return Promise.reject('Method Not Found')
}

function bcreadMT(method, ...params) {
  const [,options = {}] = params
  if (!options.blockTag) delete options.blockTag
  const client = web3client.get(config.mentoring_address, MentoringOraclyV1.abi, { readonly: true })
  if (isFunction(client[method])) return client[method](...params)
  return Promise.reject('Method Not Found')
}

function bcwriteMT(method, ...params) {
  const client = web3client.get(config.mentoring_address, MentoringOraclyV1.abi)
  if (isFunction(client[method])) return client[method](...params)
  return Promise.reject('Method Not Found')
}

export default {

  // CDN nickname resolution
  [RESOVLE_ADDRESS_TO_NICKNAME]: ({ address }) => UserApi.getNickname({ address }),

  // pricefeed
  // rounds
  [GET_PRICE_FEED]: PriceFeedApi.getRounds,
  [GET_LATEST_PRICE_FEED]: PriceFeedApi.getLatest,
  [GET_SETTLEMENTS_BY_IDS]: ({ pricefeed, settlmentids }) => PriceFeedApi.getSettlments({ settlmentids, pricefeed }),

  // web3
  // web3auth
  [REQUEST_AUTHENTICATION_PSIG]: ({ from, nickname }) => web3client.request({ method: 'personal_sign', params: [toHex(replace(config.sig_requests[AUTH], [nickname || from, from, formatUnixTS(nowUnixTS(), 'MMM dd yyyy')])), from] }),

  // OraclyV1 write
  [PLACE_PREDICTION]: ({ wager, position, gameid, roundid }) => bcwriteOraclyV1('placePrediction', wager, String(position), gameid, roundid, { gasLimit: 1_500_000 }),
  [WITHDRAW]: ({ roundid, predictionid, erc20 }) => bcwriteOraclyV1('withdraw', roundid, predictionid, erc20, { gasLimit: 1_000_000 }),
  [RESOLVE_WITHDRAW]: ({ roundid, predictionid, erc20, resolution }) => bcwriteOraclyV1('resolve4withdraw', roundid, predictionid, erc20, resolution, { gasLimit: 1_500_000 }),
  [RESOLVE_WITHDRAW_NOCONTEST]: ({ roundid, predictionid, erc20 }) => bcwriteOraclyV1('resolve4withdraw', roundid, predictionid, erc20, 0, { gasLimit: 700_000 }),
  [RESOLVE]: ({ roundid, resolution }) => bcwriteOraclyV1('resolve', roundid, resolution, { gasLimit: 300_000 }),
  [RESOLVE_NOCONTEST]: ({ roundid }) => bcwriteOraclyV1('resolve', roundid, 0, { gasLimit: 300_000 }),

  // oracly read
  [READ_BLOCKCHAIN_ROUND_BY_ID]: ({ roundid, txn: { blockNumber } }) => bcreadOraclyV1('getRound', roundid, { blockTag: blockNumber }),
  [READ_BLOCKCHAIN_PREDICTION_BY_ID]: ({ predictionid, txn: { blockNumber } }) => bcreadOraclyV1('getPrediction', predictionid, { blockTag: blockNumber }),
  [READ_BLOCKCHAIN_LATEST_PREDICTIONS_BY_ROUNDID]: ({ roundid, position, offset, txn: { blockNumber } }) => bcreadOraclyV1('getRoundPredictions', roundid, position || 0, offset || 0, { blockTag: blockNumber }), // position=0;ALL
  [READ_BLOCKCHAIN_LATEST_PREDICTIONS_BY_ADDRESS]: ({ address, position, offset, txn: { blockNumber } }) => bcreadOraclyV1('getBettorPredictions', address, position || 0, offset || 0, { blockTag: blockNumber }), // position=0;ALL
  [READ_BLOCKCHAIN_LATEST_ROUNDS_BY_GAMEID]: ({ gameid, offset, txn: { blockNumber } }) => bcreadOraclyV1('getGameRounds', gameid, offset || 0, { blockTag: blockNumber }),
  [READ_BLOCKCHAIN_BLOCK_NUMBER]: () => DEFAULT_WEB3_PROVIDER.getBlockNumber(),
  [GET_BLOCKCHAIN_BETTOR_STATISTICS]: ({ bettorid, erc20, txn: { blockNumber } }) => bcreadOraclyV1('getBettor', bettorid, erc20, { blockTag: blockNumber }),
  [GET_BLOCKCHAIN_BETTOR_LAST_ACTIVITY_STATISTICS]: ({ bettorid, txn: { blockNumber } }) => bcreadOraclyV1('getBettorPredictions', bettorid, 0, 0, { blockTag: blockNumber }),
  [GET_BLOCKCHAIN_BETTOR_JOINED_STATISTICS]: ({ bettorid, offset, txn: { blockNumber } }) => bcreadOraclyV1('getBettorPredictions', bettorid, 0, offset, { blockTag: blockNumber }),

  // mint DEMO
  [MINT_DEMO_1000]: () => bcwriteDEMO('mint', { gasLimit: 100_000 }),

  // mentoring read
  [GET_BLOCKCHAIN_MENTOR_STATISTICS]: ({ mentorid, erc20, txn: { blockNumber } }) => bcreadMT('getMentor', mentorid, erc20, { blockTag: blockNumber }),

  // mentoring write
  [JOIN_MENTOR]: ({ mentorid }) => bcwriteMT('joinMentor', mentorid, { gasLimit: 750_000 }),

  // staking read
  [GET_BLOCKCHAIN_STAKER_STAKE_STATISTICS]: ({ stakerid, txn: { blockNumber } }) => bcreadST('getStakeOf', stakerid, { blockTag: blockNumber }),
  [GET_BLOCKCHAIN_STAKER_PAIDOUT_STATISTICS]: ({ stakerid, erc20, txn: { blockNumber } }) => bcreadST('getStakerPaidout', stakerid, erc20, { blockTag: blockNumber }),
  [GET_BLOCKCHAIN_STAKING_ACTUAL_EPOCH_ID]: ({ txn: { blockNumber } }) => bcreadST('ACTUAL_EPOCH_ID', { blockTag: blockNumber }),
  [GET_BLOCKCHAIN_STAKING_ACTUAL_EPOCH_STATISTICS]: ({ epochid, erc20, txn: { blockNumber } }) => bcreadST('getEpoch', epochid, erc20, { blockTag: blockNumber }),
  [GET_BLOCKCHAIN_STAKER_LAST_ACTIVITY_STATISTICS]: ({ stakerid, txn: { blockNumber } }) => bcreadST('getStakerDeposits', stakerid, 0, { blockTag: blockNumber }),
  [GET_BLOCKCHAIN_STAKER_JOINED_STATISTICS]: ({ stakerid, offset, txn: { blockNumber } }) => bcreadST('getStakerDeposits', stakerid, offset, { blockTag: blockNumber }),

  // TXN
  [AWAIT_TRANSACTION]: ({ txn: { hash } }) => web3client.waitForTransaction(hash),
  [NOTIFY_ABOUT_FAILED_TRANSACTION]: ({ txn }) => web3client.call(pick(txn, ['to', 'from', 'nonce', 'gasLimit', 'gasPrice', 'data', 'value', 'chainId', 'type', 'accessList']), txn.blockNumber),
  // erc20
  [GET_BALANCE]: ({ erc20, account, txn: { blockNumber } }) => bcreadERC('balanceOf', erc20, account, { blockTag: blockNumber }),
  [GET_ALLOWANCE]: ({ erc20, account, target, txn: { blockNumber } }) => bcreadERC('allowance', erc20, account, target || config.oraclyv1_address, { blockTag: blockNumber }),

  // gas token
  [GET_GAS_BALANCE]: ({ account, txn: { blockNumber } }) => web3client.getBalance(account, blockNumber),

  [APPROVE_ACCOUNT_ALLOWANCE]: ({ erc20, amount, target }) => bcwriteERC('approve', erc20, target || config.oraclyv1_address, amount, { gasLimit: 100_000 }),

  // Swap
  [SWAP_NATIVE_ERC20]: ({ account, erc20, quote, pooldata }) => swapClient.swap(account, erc20, quote, pooldata, { gasLimit: 500_000 }),
  [READ_BLOCKCHAIN_SWAP_NATIVE_ERC20_POOL]: ({ erc20 }) => swapClient.readPool(erc20),
  [READ_BLOCKCHAIN_SWAP_NATIVE_ERC20_QUOTE_EX_IN]: ({ erc20, amount, pool }) => swapClient.readQuoteExIn(amount, erc20, pool),
  [READ_BLOCKCHAIN_SWAP_NATIVE_ERC20_QUOTE_EX_OUT]: ({ erc20, amount, pool }) => swapClient.readQuoteExOut(amount, erc20, pool),

  [GET_GAMES]: ({ filter }) => Promise.resolve({ data: { games: compact(map(GAME_DEFAULTS, mtp =>
    (
      (!filter.level || filter.level === LEVEL_VERSION[mtp.version % 1000]) &&
      (!filter.currency || ERC20[filter.currency] === mtp.erc20) &&
      (!filter.schedule || filter.schedule === mtp.schedule)
    )
      ? { ...mtp, gameid: toGameId(mtp) }
      : null
    ))
  }}),

  // chat
  [CHAT_SEND]: (params) => ChatSocket.send(params),
  [GET_CHAT_CHANNELS]: () => ChatApi.getChannels(),
  [GET_CHAT_CHANNEL_ONLINE]: ({ channel }) => ChatApi.getChannelOnline(channel),
}
