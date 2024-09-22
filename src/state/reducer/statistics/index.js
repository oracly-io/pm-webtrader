import { isEmpty, toLower } from 'lodash'
import { toDecimalERC20 } from '@oracly/pm-libs/calc-utils'
import { set } from '@oracly/pm-libs/immutable'
import { success } from '@oracly/pm-libs/redux-cqrs'

import { GET_BLOCKCHAIN_MENTOR_STATISTICS } from '@actions'
import { GET_BLOCKCHAIN_STAKER_STAKE_STATISTICS } from '@actions'
import { GET_BLOCKCHAIN_STAKING_ACTUAL_EPOCH_ID } from '@actions'
import { GET_BLOCKCHAIN_STAKING_ACTUAL_EPOCH_STATISTICS } from '@actions'
import { GET_BLOCKCHAIN_STAKER_PAIDOUT_STATISTICS } from '@actions'
import { GET_BLOCKCHAIN_STAKER_LAST_ACTIVITY_STATISTICS } from '@actions'
import { GET_BLOCKCHAIN_STAKER_JOINED_STATISTICS } from '@actions'
import { GET_BLOCKCHAIN_BETTOR_STATISTICS } from '@actions'
import { GET_BLOCKCHAIN_BETTOR_JOINED_STATISTICS } from '@actions'
import { GET_BLOCKCHAIN_BETTOR_LAST_ACTIVITY_STATISTICS } from '@actions'
import { ERC20, ORCY_ADDRESS } from '@constants'
import { blockchain2BettorMap, blockchain2PredictionMap } from '@state/mappers'
import { blockchain2EpochMap, blockchain2DepositMap } from '@state/mappers'
import { blockchain2MentorMap, blockchain2MentorFundMap } from '@state/mappers'

export default {

  [success(GET_BLOCKCHAIN_MENTOR_STATISTICS)]: (state, { mentorid, erc20, result: bcmentor }) => {

    const bcmentorMap = blockchain2MentorMap(bcmentor)

    if (!Number(bcmentorMap.createdAt)) return state

    state = set(state, [mentorid, 'mentor', 'stats', 'proteges', 'amount'], bcmentorMap.circle)
    state = set(state, [mentorid, 'mentor', 'stats', 'joined'], bcmentorMap.createdAt)
    state = set(state, [mentorid, 'mentor', 'stats', 'last activity'], bcmentorMap.updatedAt)

    const currency = ERC20[erc20]
    const bcmentorFundMap = blockchain2MentorFundMap(bcmentor)

    if (!Number(bcmentorFundMap.earned)) return state

    state = set(state, [mentorid, 'mentor', 'tokenStats', currency, 'earned'], {
      amount: toDecimalERC20(bcmentorFundMap.earned, erc20),
      currency,
      erc20: erc20,
    })

    return state
  },

  [success(GET_BLOCKCHAIN_STAKING_ACTUAL_EPOCH_ID)]: (state, { result: epochid }) => {

    if (!isEmpty(epochid)) {
      state = set(state, ['_meta', 'staking', 'actualEpoch', 'id'], epochid)
    }

    return state
  },

  [success(GET_BLOCKCHAIN_STAKING_ACTUAL_EPOCH_STATISTICS)]: (state, { result: bcepoch }) => {

    if (!isEmpty(bcepoch)) {
      const bcepochMap = blockchain2EpochMap(bcepoch)
      state = set(state, ['_meta', 'staking', 'actualEpoch', 'stakefund'], toDecimalERC20(bcepochMap.stakefund, ORCY_ADDRESS))
    }

    return state
  },

  [success(GET_BLOCKCHAIN_STAKER_LAST_ACTIVITY_STATISTICS)]: (state, { stakerid, result }) => {

    const [[bcdeposit], size] = result
    if (size === '0') return state

    const depositMap = blockchain2DepositMap(bcdeposit)

    state = set(state, [stakerid, 'staker', 'stats', 'last activity'], depositMap.stakedAt)

    state = set(state, [stakerid, 'staker', '_meta', 'depositsSize'], size)

    return state
  },

  [success(GET_BLOCKCHAIN_STAKER_STAKE_STATISTICS)]: (state, { stakerid, result: staked }) => {

    if (!Number(staked)) return state

    state = set(state, [stakerid, 'staker', 'stats', 'staked', 'amount'], toDecimalERC20(staked, ORCY_ADDRESS))
    state = set(state, [stakerid, 'staker', 'stats', 'staked', 'currency'], ERC20[ORCY_ADDRESS])

    return state
  },


  [success(GET_BLOCKCHAIN_STAKER_PAIDOUT_STATISTICS)]: (state, { stakerid, erc20, result: payout }) => {

    if (!Number(payout)) return state

    const currency = ERC20[erc20]
    state = set(state, [stakerid, 'staker', 'tokenStats', currency], {
      amount: toDecimalERC20(payout, erc20),
      currency,
    })

    return state

  },

  [success(GET_BLOCKCHAIN_STAKER_JOINED_STATISTICS)]: (state, { stakerid, result }) => {

    const [[bcdeposit], size] = result
    if (size === '0') return state

    const depositMap = blockchain2DepositMap(bcdeposit)

    state = set(state, [stakerid, 'staker', 'stats', 'joined'], depositMap.stakedAt)

    return state

  },

  [success(GET_BLOCKCHAIN_BETTOR_STATISTICS)]: (state, { bettorid, erc20, result: bcbettor }) => {

    const bcbettorMap = blockchain2BettorMap(bcbettor)

    if (toLower(bcbettorMap.id) !== toLower(bettorid)) return state

    state = set(state, [bettorid, 'bettor', 'stats', 'predictions'], bcbettorMap.predictionsTotal)

    const currency = ERC20[erc20]

    if (Number(bcbettorMap.depositTotal)) {
      state = set(state, [bettorid, 'bettor', 'tokenStats', currency, 'wagered'], {
        amount: toDecimalERC20(bcbettorMap.depositTotal, erc20),
        currency,
        erc20,
      })
    }

    if (Number(bcbettorMap.paidoutTotal)) {
      state = set(state, [bettorid, 'bettor', 'tokenStats', currency, 'earned'], {
        amount: toDecimalERC20(bcbettorMap.paidoutTotal, erc20),
        currency,
        erc20,
      })
    }

    return state

  },

  [success(GET_BLOCKCHAIN_BETTOR_LAST_ACTIVITY_STATISTICS)]: (state, { bettorid, result }) => {

    const [[bcprediction], size] = result
    if (size === '0') return state

    const predictionMap = blockchain2PredictionMap(bcprediction)

    state = set(state, [bettorid, 'bettor', 'stats', 'last activity'], predictionMap.createdAt)

    state = set(state, [bettorid, 'bettor', '_meta', 'predictionsSize'], size)

    return state
  },

  [success(GET_BLOCKCHAIN_BETTOR_JOINED_STATISTICS)]: (state, { bettorid, result }) => {

    const [[bcprediction], size] = result
    if (size === '0') return state

    const predictionMap = blockchain2PredictionMap(bcprediction)

    state = set(state, [bettorid, 'bettor', 'stats', 'joined'], predictionMap.createdAt)

    return state

  },

}
