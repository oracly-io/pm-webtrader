import { isEmpty, isString, has, get, pick, concat } from 'lodash'
import { actualReturn } from '@oracly/pm-libs/calc-utils'
import { command, query, success, findAction } from '@oracly/pm-libs/redux-cqrs'

import logger from '@lib/logger'

import config from '@config'
import { TXN_COMMITED, TXN_REVERTED } from '@constants'

import { getActiveERC20, getActiveAccountAddress } from '@state/getters'
import { getRoundById, getPredictionById } from '@state/getters'

import { AWAIT_TRANSACTION, GET_ALLOWANCE } from '@actions'
import { GET_BALANCE, SWAP_NATIVE_ERC20 } from '@actions'
import { PLACE_PREDICTION, APPROVE_ACCOUNT_ALLOWANCE } from '@actions'
import { READ_BLOCKCHAIN_PREDICTION_BY_ID, READ_BLOCKCHAIN_ROUND_BY_ID } from '@actions'
import { WITHDRAW, RESOLVE_WITHDRAW, RESOLVE_WITHDRAW_NOCONTEST } from '@actions'
import { NOTIFY_ABOUT_FAILED_TRANSACTION } from '@actions'
import { SET_PREDICTION_PROPS_BY_ID } from '@actions'
import { READ_BLOCKCHAIN_LATEST_PREDICTIONS_BY_ADDRESS } from '@actions'
import { READ_BLOCKCHAIN_LATEST_PREDICTIONS_BY_ROUNDID } from '@actions'

import { toPredictionId } from '@state/mappers'

export default {
  traceer: {
    detect: (action) => {
      // NOTE: making tracing in detect function showing better performance
      if (config.action_tracer) logger.info(action.type, action)
      return false
    },
    intercept: () => { } // eslint-disable-line
  },
  cryptoTXN: {
    detect: (action) => {
      const path = ['args', 'result']
      return (
        has(action, concat(path, 'hash')) &&
        has(action, concat(path, 'blockNumber')) &&
        has(action, concat(path, 'blockHash'))
      )
    },
    intercept: (action, store) => {
      const txn = get(action, ['args', 'result'])
      if (isString(txn.hash) && Number(txn.hash)) {
        store.dispatch(query(
          AWAIT_TRANSACTION,
          { txn },
          { origin: action }
        ))
      }
    }
  },
  updateBalance: {
    detect: (action) => action.type === success(AWAIT_TRANSACTION),
    intercept: (action, store) => {
      const txn = pick(get(action, ['args', 'result']), ['transactionHash', 'blockNumber', 'blockHash', 'status'])

      if (txn.status !== TXN_COMMITED) return

      let account = getActiveAccountAddress(store.getState())

      if (!account) return

      let erc20 = getActiveERC20(store.getState())

      // SWAP_NATIVE_ERC20
      const action_SWAP_NATIVE_ERC20 = findAction(action, success(SWAP_NATIVE_ERC20))
      if (action_SWAP_NATIVE_ERC20) {
        account = get(action_SWAP_NATIVE_ERC20, ['args', 'account'])
        erc20 = get(action_SWAP_NATIVE_ERC20, ['args', 'erc20'])
        store.dispatch(query(GET_BALANCE, { erc20, account, txn }, { origin: action }))
        return
      }

      // PLACE_PREDICTION
      const action_PLACE_PREDICTION = findAction(action, success(PLACE_PREDICTION))
      if (action_PLACE_PREDICTION) {
        store.dispatch(query(GET_BALANCE, { erc20, account, txn }, { origin: action }))
        return
      }

      // WITHDRAW
      const action_WITHDRAW = findAction(action, success(WITHDRAW))
      if (action_WITHDRAW) {
        erc20 = get(action_WITHDRAW, ['args', 'erc20'])
        store.dispatch(query(GET_BALANCE, { erc20, account, txn }, { origin: action }))
        return
      }

      // RESOLVE_WITHDRAW
      const action_RESOLVE_WITHDRAW = findAction(action, success(RESOLVE_WITHDRAW))
      if (action_RESOLVE_WITHDRAW) {
        erc20 = get(action_RESOLVE_WITHDRAW, ['args', 'erc20'])
        store.dispatch(query(GET_BALANCE, { erc20, account, txn }, { origin: action }))
        return
      }

      // RESOLVE_WITHDRAW_NOCONTEST
      const action_RESOLVE_WITHDRAW_NOCONTEST = findAction(action, success(RESOLVE_WITHDRAW_NOCONTEST))
      if (action_RESOLVE_WITHDRAW_NOCONTEST) {
        erc20 = get(action_RESOLVE_WITHDRAW_NOCONTEST, ['args', 'erc20'])
        store.dispatch(query(GET_BALANCE, { erc20, account, txn }, { origin: action }))
        return
      }

    }
  },
  updateAllowance: {
    detect: (action) => action.type === success(AWAIT_TRANSACTION),
    intercept: (action, store) => {

      const action_APPROVE_ACCOUNT_ALLOWANCE = findAction(action, success(APPROVE_ACCOUNT_ALLOWANCE))
      if (action_APPROVE_ACCOUNT_ALLOWANCE) {
        const txn = pick(get(action, ['args', 'result']), ['blockNumber'])
        const account = getActiveAccountAddress(store.getState())
        const erc20 = get(action_APPROVE_ACCOUNT_ALLOWANCE, ['args', 'erc20'])

        if (!account) return
        if (!erc20) return
        if (isEmpty(txn)) return

        store.dispatch(query(GET_ALLOWANCE, { account, erc20, txn }, { origin: action }))
      }
    }
  },
  readEntitiesFromBlockchain: {
    detect: (action) => action.type === success(AWAIT_TRANSACTION),
    intercept: (action, store) => {
      const txn = pick(get(action, ['args', 'result']), ['transactionHash', 'blockNumber', 'blockHash', 'status'])

      // PLACE_PREDICTION
      const action_PLACE_PREDICTION = findAction(action, success(PLACE_PREDICTION))
      if (action_PLACE_PREDICTION && txn.status === TXN_COMMITED) {

        const roundid = get(action_PLACE_PREDICTION, ['args', 'roundid'])
        store.dispatch(query(
          READ_BLOCKCHAIN_ROUND_BY_ID,
          { roundid, txn },
          { origin: action }
        ))

        const predictionid = toPredictionId(action_PLACE_PREDICTION.args)
        store.dispatch(query(
          READ_BLOCKCHAIN_PREDICTION_BY_ID,
          { predictionid, txn },
          { origin: action }
        ))

        // Update bettor total predictions size
        const address = get(action_PLACE_PREDICTION, ['args', 'account'])
        store.dispatch(query(
          READ_BLOCKCHAIN_LATEST_PREDICTIONS_BY_ADDRESS,
          { address, txn },
          { origin: action },
        ))

        // Update round total predictions size
        store.dispatch(query(
          READ_BLOCKCHAIN_LATEST_PREDICTIONS_BY_ROUNDID,
          { roundid, txn },
          { origin: action },
        ))
      }

      // RESOLVE_WITHDRAW
      // NOTE: reason of unseccesfull withdraw could be resolved by updating the entiry from blockchain
      const action_RESOLVE_WITHDRAW = (
        findAction(action, success(RESOLVE_WITHDRAW)) ||
        findAction(action, success(RESOLVE_WITHDRAW_NOCONTEST))
      )
      if (action_RESOLVE_WITHDRAW) {

        const roundid = get(action_RESOLVE_WITHDRAW, ['args', 'roundid'])
        store.dispatch(query(
          READ_BLOCKCHAIN_ROUND_BY_ID,
          { roundid, txn },
          { origin: action }
        ))

        const predictionid = get(action_RESOLVE_WITHDRAW, ['args', 'predictionid'])
        store.dispatch(query(
          READ_BLOCKCHAIN_PREDICTION_BY_ID,
          { predictionid, txn },
          { origin: action }
        ))

        // NOTE: pre-update prediction, success withraw
        const prediction = getPredictionById(predictionid)
        const round = getRoundById(prediction?.roundid)
        if (!isEmpty(prediction) && !isEmpty(round)) {
          const payout = actualReturn(round.prizefunds, prediction.wager, prediction.position)
          store.dispatch(command(
            SET_PREDICTION_PROPS_BY_ID,
            { predictionid, props: { claimed: true, payout }, txn },
            { origin: action }
          ))
        }

      }

      // WITHDRAW
      // NOTE: reason of unseccesfull withdraw could be resolved by updating the entiry from blockchain
      const action_WITHDRAW = findAction(action, success(WITHDRAW))
      if (action_WITHDRAW) {

        const predictionid = get(action_WITHDRAW, ['args', 'predictionid'])
        store.dispatch(query(
          READ_BLOCKCHAIN_PREDICTION_BY_ID,
          { predictionid, txn },
          { origin: action }
        ))

        // NOTE: pre-update prediction, success withraw
        const prediction = getPredictionById(predictionid)
        const round = getRoundById(prediction?.roundid)
        if (!isEmpty(prediction) && !isEmpty(round)) {
          const payout = actualReturn(round.prizefunds, prediction.wager, prediction.position)
          store.dispatch(command(
            SET_PREDICTION_PROPS_BY_ID,
            { predictionid, props: { claimed: true, payout }, txn },
            { origin: action }
          ))
        }

      }

    }

  },

  transactionsNotifier: {
    detect: (action) => action.type === success(AWAIT_TRANSACTION),
    intercept: (action, store) => {
      const txnReceipt = get(action, ['args', 'result'])
      const txnResponse = get(action, ['args', 'txn'])

      // PLACE_PREDICTION
      const action_PLACE_PREDICTION = findAction(action, success(PLACE_PREDICTION))
      if (action_PLACE_PREDICTION && txnReceipt.status === TXN_REVERTED) {
        const predictionid = toPredictionId(action_PLACE_PREDICTION.args)

        store.dispatch(command(
          NOTIFY_ABOUT_FAILED_TRANSACTION,
          {
            txn: { ...txnResponse, blockNumber: txnReceipt.blockNumber },
            relationid: predictionid,
          },
          { origin: action },
        ))

      }

    }
  },
}
