import { map, reduce, uniq, values, first, uniqBy } from 'lodash'
import { ActionScheduler } from '@oracly/pm-libs/action-scheduler'
import { query, command } from '@oracly/pm-libs/redux-cqrs'

import { GET_CHAT_CHANNEL_ONLINE } from '@actions'
import { GET_SETTLEMENTS_BY_IDS } from '@actions'
import { READ_BLOCKCHAIN_ROUND_BY_ID } from '@actions'
import { READ_BLOCKCHAIN_PREDICTION_BY_ID } from '@actions'
import { READ_BLOCKCHAIN_BLOCK_NUMBER } from '@actions'

const mergeByMaxBlockNumber = (queries, getid) => {

  return values(reduce(queries, (result, args) => {
    if (!args.txn) return result
    if (!Number(args.txn.blockNumber)) return result
    if (!getid(args)) return result

    const id = getid(args)
    if (!result[id]) result[id] = args

    if (result[id].txn.blockNumber < args.txn.blockNumber) {
      result[id] = args
    }

    return result

  }, {}))

}

const initActionsScheduler = (store) => {
  const mergers = {
    [GET_SETTLEMENTS_BY_IDS]: (queries) => {
      const queriesMap = reduce(queries, (result, { pricefeed, settlmentids }) => {
        result[pricefeed] = result[pricefeed] || []
        result[pricefeed].push(...settlmentids)
        result[pricefeed] = uniq(result[pricefeed])
        return result
      }, {})

      return {
        [GET_SETTLEMENTS_BY_IDS]: map(queriesMap, (settlmentids, pricefeed) => ({
          pricefeed,
          settlmentids
        })),
      }
    },

    [READ_BLOCKCHAIN_ROUND_BY_ID]: (queries) => ({
      [READ_BLOCKCHAIN_ROUND_BY_ID]: mergeByMaxBlockNumber(queries, ({ roundid }) => roundid)
    }),

    [READ_BLOCKCHAIN_PREDICTION_BY_ID]: (queries) => ({
      [READ_BLOCKCHAIN_PREDICTION_BY_ID]: mergeByMaxBlockNumber(queries, ({ predicitonid }) => predicitonid)
    }),

    [READ_BLOCKCHAIN_BLOCK_NUMBER]: (queries) => ({
      [READ_BLOCKCHAIN_BLOCK_NUMBER]: [first(queries)]
    }),

    [GET_CHAT_CHANNEL_ONLINE]: (queries) => ({
      [GET_CHAT_CHANNEL_ONLINE]: uniqBy(queries, ({ channel, loadType }) => `${channel}.${loadType}`)
    })
  }

  ActionScheduler.init({
    query: { store, mergers, dispatch: (name, args) => store.dispatch(query(name, args)) },
    command: { store, dispatch: (name, args) => store.dispatch(command(name, args)) },
  })
}

export default initActionsScheduler
