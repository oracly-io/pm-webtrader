import { get } from '@oracly/pm-libs/immutable'

function getBlocks(state) {
  return get(state, ['blockchain', 'blocks'])
}

export function getBlockLatest(state) {
  return get(getBlocks(state), ['latest'])
}

export function getLatestbcBlock(state) {
  return get(getBlocks(state), ['latest_bc'])
}

export function getLatestbcBlockNumber(state) {
  return get(getLatestbcBlock(state), ['number'])
}

export function getLatestbcBlockTimestamp(state) {
  return get(getLatestbcBlock(state), ['timestamp'])
}

export function getBlockNumberLatest(state) {
  return get(getBlockLatest(state), ['number'])
}

export function getBlockHashLatest(state) {
  return get(getBlockLatest(state), ['hash'])
}

export function getBlocksEntities(state) {
  return get(getBlocks(state), ['entity'])
}

export function getBlockNumberEntity(state, entityid) {
  return get(getBlocksEntities(state), [entityid, 'number'])
}

export function getBlockHashEntity(state, entityid) {
  return get(getBlocksEntities(state), [entityid, 'hash'])
}

