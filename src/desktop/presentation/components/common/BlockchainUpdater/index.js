import React from 'react'
import { sub } from '@oracly/pm-libs/calc-utils'
import { nowUnixTS } from '@oracly/pm-libs/date-utils'

import { READ_BLOCKCHAIN_LATEST_PREDICTIONS_BY_ADDRESS } from '@actions'
import { READ_BLOCKCHAIN_LATEST_PREDICTIONS_BY_ROUNDID } from '@actions'
import { READ_BLOCKCHAIN_BLOCK_NUMBER } from '@actions'
import { READ_BLOCKCHAIN_ROUND_BY_ID } from '@actions'
import { GET_PRICE_FEED } from '@actions'
import { GET_BLOCKCHAIN_MENTOR_STATISTICS } from '@actions'
import { GET_BLOCKCHAIN_STAKING_ACTUAL_EPOCH_STATISTICS } from '@actions'
import { GET_BLOCKCHAIN_STAKING_ACTUAL_EPOCH_ID } from '@actions'
import { GET_BLOCKCHAIN_STAKER_PAIDOUT_STATISTICS } from '@actions'
import { GET_BLOCKCHAIN_STAKER_STAKE_STATISTICS } from '@actions'
import { GET_BLOCKCHAIN_STAKER_LAST_ACTIVITY_STATISTICS } from '@actions'
import { GET_BLOCKCHAIN_STAKER_JOINED_STATISTICS } from '@actions'
import { GET_BLOCKCHAIN_BETTOR_STATISTICS } from '@actions'
import { GET_BLOCKCHAIN_BETTOR_LAST_ACTIVITY_STATISTICS } from '@actions'
import { GET_BLOCKCHAIN_BETTOR_JOINED_STATISTICS } from '@actions'
import { RESOVLE_ADDRESS_TO_NICKNAME } from '@actions'
import { APPLICATION_NETWORK_STATUS } from '@actions'
import { LT, UNIX_DAY } from '@constants'
import { DEMO_ADDRESS, USDC_ADDRESS, ORCY_ADDRESS } from '@constants'
import { useScheduledCommand, useScheduledQuery, useEffectState } from '@hooks'
import { connect } from '@state'
import { getBettingBettorPredictionsSize, getLatestbcBlock, getNetworkStatus } from '@state/getters'
import { getStakingActualEpochId, isOnline } from '@state/getters'
import { getActiveAccountAddress, getAccountNickname } from '@state/getters'
import { getStatisticsBarAccount, isNeverPerformed } from '@state/getters'
import { getActualRoundId, getLatestbcBlockNumber } from '@state/getters'
import { getActiveGameChartDateLatestPrice } from '@state/getters'
import { getGameById, getActiveGameId } from '@state/getters'
import { getStakingStakerDepositsSize } from '@state/getters'
import { getStatisticsBarIsOpened } from '@state/getters'
import { getUpdatableRoundids } from '@state/getters'

import { determineNetworkStatus } from '@utils'

const BlockchainUpdater = ({
  address,
  roundid,
  game,
  statisticsBarAccount,
  isStatisticsBarOpened,
  is_bc_blockNumberExist,
  is_actualEpochExist,
  is_stakerDepositsSizeExist,
  is_bettorPredictionsSizeExist,

  RESOVLE_ADDRESS_TO_NICKNAME,
}) => {
  const pricefeed = game?.pricefeed

  useScheduledQuery((query, state) => {
    const latestprice = getActiveGameChartDateLatestPrice(state)

    // update pricefeed
    if (pricefeed) {
      const from = latestprice?.timestamp || nowUnixTS()-UNIX_DAY
      const to = nowUnixTS()
      query(GET_PRICE_FEED, { pricefeed, from, to }, { schedule: 4 })
    }

  }, [address, pricefeed])

  // NOTE: it's inportant to take address via props
  // to update predictions when address changes
  useScheduledQuery((query, state) => {

    const blockNumber = getLatestbcBlockNumber(state)
    if (!blockNumber) return

    if (address) {
      query(
        READ_BLOCKCHAIN_LATEST_PREDICTIONS_BY_ADDRESS,
        { address, txn: { blockNumber } },
        { schedule: 20 }
      )
    }
  }, [address])


  useScheduledQuery((query, state) => {
    query(READ_BLOCKCHAIN_BLOCK_NUMBER, {}, { schedule: 30 })

    // block entity update if no version (blockNumber used as version)
    const blockNumber = getLatestbcBlockNumber(state)
    if (!blockNumber) return

    // take max 5 to not overload rpc gateways
    let roundids = getUpdatableRoundids(state, 5)
    for (const roundid of roundids) {
      if (roundid) {
        query(READ_BLOCKCHAIN_ROUND_BY_ID, { roundid, txn: { blockNumber } }, { schedule: 10 })
      }
    }

  }, [])

  useScheduledQuery((query, state) => {
    if (!roundid) return

    const blockNumber = getLatestbcBlockNumber(state)
    if (!blockNumber) return

    query(READ_BLOCKCHAIN_ROUND_BY_ID, { roundid, txn: { blockNumber } }, { schedule: 5 })
    query(READ_BLOCKCHAIN_LATEST_PREDICTIONS_BY_ROUNDID, { roundid, txn: { blockNumber } }, { schedule: 5 })

  }, [roundid])

  useScheduledQuery((query, state) => {
    if (isStatisticsBarOpened && statisticsBarAccount && is_bc_blockNumberExist) {
      const blockNumber = getLatestbcBlockNumber(state)

      // mentor
      const isMentorStatisticsNeverPerformed = isNeverPerformed(state, GET_BLOCKCHAIN_MENTOR_STATISTICS, [statisticsBarAccount, LT.INITIAL])
      query(GET_BLOCKCHAIN_MENTOR_STATISTICS, {
        mentorid: statisticsBarAccount,
        erc20: USDC_ADDRESS,
        txn: { blockNumber },
        loadType: isMentorStatisticsNeverPerformed ? LT.INITIAL : LT.UPDATE,
      }, { schedule: 300 })
      query(GET_BLOCKCHAIN_MENTOR_STATISTICS, {
        mentorid: statisticsBarAccount,
        erc20: DEMO_ADDRESS,
        txn: { blockNumber },
        loadType: isMentorStatisticsNeverPerformed ? LT.INITIAL : LT.UPDATE,
      }, { schedule: 300 })

      // staker
      const isStakerPaidoutNeverPerformed = isNeverPerformed(state, GET_BLOCKCHAIN_STAKER_PAIDOUT_STATISTICS, [statisticsBarAccount, LT.INITIAL])
      const isStakerLastActivityNeverPerformed = isNeverPerformed(state, GET_BLOCKCHAIN_STAKER_LAST_ACTIVITY_STATISTICS, [statisticsBarAccount, LT.INITIAL])
      const isStakerStakeNeverPerformed = isNeverPerformed(state, GET_BLOCKCHAIN_STAKER_STAKE_STATISTICS, [statisticsBarAccount, LT.INITIAL])
      query(GET_BLOCKCHAIN_STAKER_STAKE_STATISTICS, {
        stakerid: statisticsBarAccount,
        txn: { blockNumber },
        loadType: isStakerStakeNeverPerformed ? LT.INITIAL : LT.UPDATE,
      }, { schedule: 300 })
      query(GET_BLOCKCHAIN_STAKER_LAST_ACTIVITY_STATISTICS, {
        stakerid: statisticsBarAccount,
        txn: { blockNumber },
        loadType: isStakerLastActivityNeverPerformed ? LT.INITIAL : LT.UPDATE,
      }, { schedule: 300 })
      query(GET_BLOCKCHAIN_STAKER_PAIDOUT_STATISTICS, {
        stakerid: statisticsBarAccount,
        erc20: USDC_ADDRESS,
        txn: { blockNumber },
        loadType: isStakerPaidoutNeverPerformed ? LT.INITIAL : LT.UPDATE,
      }, { schedule: 300 })
      query(GET_BLOCKCHAIN_STAKER_PAIDOUT_STATISTICS, {
        stakerid: statisticsBarAccount,
        erc20: ORCY_ADDRESS,
        txn: { blockNumber },
        loadType: isStakerPaidoutNeverPerformed ? LT.INITIAL : LT.UPDATE,
      }, { schedule: 300 })
      query(GET_BLOCKCHAIN_STAKER_PAIDOUT_STATISTICS, {
        stakerid: statisticsBarAccount,
        erc20: DEMO_ADDRESS,
        txn: { blockNumber },
        loadType: isStakerPaidoutNeverPerformed ? LT.INITIAL : LT.UPDATE,
      }, { schedule: 300 })

      // bettor
      const isBettorStatisticsNeverPerformed = isNeverPerformed(state, GET_BLOCKCHAIN_BETTOR_STATISTICS, [statisticsBarAccount, LT.INITIAL])
      const isBettorLastActivityNeverPerformed = isNeverPerformed(state, GET_BLOCKCHAIN_BETTOR_LAST_ACTIVITY_STATISTICS, [statisticsBarAccount, LT.INITIAL])
      query(GET_BLOCKCHAIN_BETTOR_STATISTICS, {
        bettorid: statisticsBarAccount,
        erc20: USDC_ADDRESS,
        txn: { blockNumber },
        loadType: isBettorStatisticsNeverPerformed ? LT.INITIAL : LT.UPDATE,
      }, { schedule: 300 })
      query(GET_BLOCKCHAIN_BETTOR_STATISTICS, {
        bettorid: statisticsBarAccount,
        erc20: ORCY_ADDRESS,
        txn: { blockNumber },
        loadType: isBettorStatisticsNeverPerformed ? LT.INITIAL : LT.UPDATE,
      }, { schedule: 300 })
      query(GET_BLOCKCHAIN_BETTOR_STATISTICS, {
        bettorid: statisticsBarAccount,
        erc20: DEMO_ADDRESS,
        txn: { blockNumber },
        loadType: isBettorStatisticsNeverPerformed ? LT.INITIAL : LT.UPDATE,
      }, { schedule: 300 })
      query(GET_BLOCKCHAIN_BETTOR_LAST_ACTIVITY_STATISTICS, {
        bettorid: statisticsBarAccount,
        txn: { blockNumber },
        loadType: isBettorLastActivityNeverPerformed ? LT.INITIAL : LT.UPDATE,
      }, { schedule: 300 })
    }
  }, [isStatisticsBarOpened, is_bc_blockNumberExist, statisticsBarAccount])

  // get actual epoch stakefund
  useScheduledQuery((query, state) => {
    if (isStatisticsBarOpened && statisticsBarAccount && is_bc_blockNumberExist) {
      const blockNumber = getLatestbcBlockNumber(state)

      if (is_actualEpochExist) {
        const actualEpochId = getStakingActualEpochId(state)
        const erc20 = ORCY_ADDRESS
        const isActualEpochNeverPerformed = isNeverPerformed(state, GET_BLOCKCHAIN_STAKING_ACTUAL_EPOCH_STATISTICS, [actualEpochId, erc20, LT.INITIAL])
        const loadType = isActualEpochNeverPerformed ? LT.INITIAL : LT.UPDATE
        query(GET_BLOCKCHAIN_STAKING_ACTUAL_EPOCH_STATISTICS, { epochid: actualEpochId, erc20: ORCY_ADDRESS, loadType, txn: { blockNumber } }, { schedule: 300 })
      } else {
        const isActualEpochIdNeverPerformed = isNeverPerformed(state, GET_BLOCKCHAIN_STAKING_ACTUAL_EPOCH_ID, [LT.INITIAL])
        const loadType = isActualEpochIdNeverPerformed ? LT.INITIAL : LT.UPDATE
        query(GET_BLOCKCHAIN_STAKING_ACTUAL_EPOCH_ID, { loadType, txn: { blockNumber } }, { schedule: 300 })
      }

    }
  }, [isStatisticsBarOpened, is_bc_blockNumberExist, is_actualEpochExist, statisticsBarAccount])

  // get staker joined
  useScheduledQuery((query, state) => {
    if (isStatisticsBarOpened && statisticsBarAccount && is_bc_blockNumberExist && is_stakerDepositsSizeExist) {
      const blockNumber = getLatestbcBlockNumber(state)
      const offset = getStakingStakerDepositsSize(state, statisticsBarAccount)
      const isStakerJoinedNeverPerformed = isNeverPerformed(state, GET_BLOCKCHAIN_STAKER_JOINED_STATISTICS, [statisticsBarAccount, LT.INITIAL])
      query(GET_BLOCKCHAIN_STAKER_JOINED_STATISTICS, {
        stakerid: statisticsBarAccount,
        offset: sub(offset, 1),
        txn: { blockNumber },
        loadType: isStakerJoinedNeverPerformed ? LT.INITIAL : LT.UPDATE,
      }, { schedule: 300 })
    }
  }, [isStatisticsBarOpened, is_bc_blockNumberExist, is_stakerDepositsSizeExist, statisticsBarAccount])

  // get bettor joined
  useScheduledQuery((query, state) => {
    if (isStatisticsBarOpened && statisticsBarAccount && is_bc_blockNumberExist && is_bettorPredictionsSizeExist) {
      const blockNumber = getLatestbcBlockNumber(state)
      const offset = getBettingBettorPredictionsSize(state, statisticsBarAccount)
      const isBettorJoinedNeverPerformed = isNeverPerformed(state, GET_BLOCKCHAIN_BETTOR_JOINED_STATISTICS, [statisticsBarAccount, LT.INITIAL])
      query(GET_BLOCKCHAIN_BETTOR_JOINED_STATISTICS, {
        bettorid: statisticsBarAccount,
        offset: sub(offset, 1),
        txn: { blockNumber },
        loadType: isBettorJoinedNeverPerformed ? LT.INITIAL : LT.UPDATE,
      }, { schedule: 300 })
    }
  }, [isStatisticsBarOpened, is_bc_blockNumberExist, is_bettorPredictionsSizeExist, statisticsBarAccount])

  // fetch user's nickname for statistics bar
  useEffectState((state) => {
    if (statisticsBarAccount) {
      const statisticsBarNickname = getAccountNickname(state, statisticsBarAccount)

      if(isStatisticsBarOpened && !statisticsBarNickname) {
        RESOVLE_ADDRESS_TO_NICKNAME({ address: statisticsBarAccount })
      }
    }
  }, [statisticsBarAccount, isStatisticsBarOpened])

  useScheduledCommand((command, state) => {
    const bcblock = getLatestbcBlock(state)
    const latestprice = getActiveGameChartDateLatestPrice(state)
    const status = determineNetworkStatus(bcblock, latestprice, isOnline(state))
    const networkStatus = getNetworkStatus(state)

    if (!status) return
    if (status === networkStatus) return

    command(APPLICATION_NETWORK_STATUS, { status }, { schedule: 1 })
  }, [])

  return null
}

export default connect(
  (state) => {
    const address = getActiveAccountAddress(state)
    const game = getGameById(state, getActiveGameId(state))
    const roundid = getActualRoundId(state, getActiveGameId(state))
    const is_bc_blockNumberExist = !!getLatestbcBlockNumber(state)
    const is_actualEpochExist = !!getStakingActualEpochId(state)
    const statisticsBarAccount = getStatisticsBarAccount(state)
    const is_stakerDepositsSizeExist = !!getStakingStakerDepositsSize(state, statisticsBarAccount)
    const isStatisticsBarOpened = getStatisticsBarIsOpened(state)
    const is_bettorPredictionsSizeExist = !!getBettingBettorPredictionsSize(state, statisticsBarAccount)

    return {
      address,
      game,
      roundid,
      is_bc_blockNumberExist,
      is_actualEpochExist,
      is_stakerDepositsSizeExist,
      is_bettorPredictionsSizeExist,
      isStatisticsBarOpened,
      statisticsBarAccount,
    }
  },
  ({ query }) => [
    query(RESOVLE_ADDRESS_TO_NICKNAME),
  ]
)(React.memo(BlockchainUpdater))

