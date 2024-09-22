import { pick, keys, filter, isEmpty, mapValues } from 'lodash'
import { get } from '@oracly/pm-libs/immutable'

import { getBlockNumberEntity } from '../blocks'

import { TXN_COMMITED, TXN_REVERTED } from '@constants'

function getTransactionsState(state) {
  return get(state, ['blockchain', 'transactions'])
}

export function getTransactionsCollection(state) {
  return get(getTransactionsState(state), ['collection'])
}

export function getTransactionsEntities(state) {
  return get(getTransactionsState(state), ['entity'])
}

export function getTransactionsGroupedByEntityId(state) {
  const collection = getTransactionsCollection(state)
  const entity = getTransactionsEntities(state)
  const grouped = mapValues(entity, (tnxids) => pick(collection, keys(tnxids)))

  return grouped
}

export function getPendingTransactions(state) {
  const txns = getTransactionsCollection(state)
  const pending = filter(txns, { blockNumber: null, blockHash: null })
  return pending
}

export function getTransactionIdsByEntityId(state, entityid) {
  return get(getTransactionsEntities(state), [entityid])
}

export function getTransactionsByEntityId(state, entityid) {
  const ids = getTransactionIdsByEntityId(state, entityid)
  const txns = pick(getTransactionsCollection(state), keys(ids))
  return txns
}

export function getComittedTransactionsByEntityId(state, entityid) {
  const txns = getTransactionsByEntityId(state, entityid)
  const commited = filter(txns, { status: TXN_COMMITED })
  return commited
}

export function getRevertedTransactionsByEntityId(state, entityid) {
  const txns = getTransactionsByEntityId(state, entityid)
  const reverted = filter(txns, { status: TXN_REVERTED })
  return reverted
}

export function getPendingTransactionsByEntityId(state, entityid) {
  const txns = getTransactionsByEntityId(state, entityid)
  const pending = filter(txns, { blockNumber: null, blockHash: null })
  return pending
}

export function getUnpropagatedTransactionsByEntityId(state, entityid) {
  const txns = getComittedTransactionsByEntityId(state, entityid)
  const entityblock = getBlockNumberEntity(state, entityid)
  const unpropagated = filter(txns, ({ blockNumber }) => blockNumber > entityblock)

  return unpropagated
}

export function isEntityPropagating(state, entityid) {
  const pending = getPendingTransactionsByEntityId(state, entityid)
  const unpropagated = getUnpropagatedTransactionsByEntityId(state, entityid)

  return (
    !isEmpty(pending) ||
    !isEmpty(unpropagated)
  )

}

export function isEnityVerified(state, entityid) {
  const commited = getComittedTransactionsByEntityId(state, entityid)
  const pending = getPendingTransactionsByEntityId(state, entityid)

  return (
    !isEmpty(commited) &&
    isEmpty(pending)
  )
}

export function isEnityReverted(state, entityid) {
  const commited = getComittedTransactionsByEntityId(state, entityid)
  const pending = getPendingTransactionsByEntityId(state, entityid)
  const reverted = getRevertedTransactionsByEntityId(state, entityid)

  return (
    isEmpty(commited) &&
    isEmpty(pending) &&
    !isEmpty(reverted)
  )
}
