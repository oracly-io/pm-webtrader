import { combineReducers } from 'redux'
import {
  keys,
  trim,
  extend,
  isPlainObject,
  mapValues
} from 'lodash'
import Persistence from '@oracly/pm-libs/persistence-js'

import logger from '@lib/logger'

export function createReducer(reducermap, path) {
  if (!isPlainObject(reducermap)) {
    throw new Error('Reducers should be a plain object')
  }
  if ('undefined' in reducermap) {
    throw new Error('missing constant, add it to state/actions.js')
  }

  // use default metadata
  if (!('metadata' in reducermap)) reducermap.metadata = {}

  const initial = reducermap.metadata.default || null
  return (state = initial, action) => {
    if (!reducermap[action.type]) return state

    const start = Date.now()
    let nextState = state
    try {
      nextState = reducermap[action.type](state, action.args, action.metadata)
    } catch (e) {
      logger.info('Reducer Error in action', action)
      logger.info('Reducer Error in reducer', keys(reducermap))
      console.error(e) // eslint-disable-line
      throw e
    }
    const reducertook = Date.now() - start
    if (reducertook > 10) {
      logger.warn('[Violation] Reducer took ' + reducertook + 'ms action:' + action.type + ', path:' + path)
    }
    if (
      action &&
      reducermap.metadata.persist in Persistence
    ) {
      Persistence[reducermap.metadata.persist].set(path, nextState)
    } else if (reducermap.metadata.persist) {
      logger.info('State will not be persisted "%s" is missing!', reducermap.metadata.persist)
    }
    const persisttook = Date.now() - start - reducertook
    if (persisttook > 10) {
      logger.warn('[Violation] Persistance took ' + persisttook + 'ms action:' + action.type + ', path:' + path)
    }
    return nextState
  }
}

// NOTE: private class used as object attribute
class Combination {
  constructor (obj) {
    if (!isPlainObject(obj)) throw Error('only plain js objects!')
    extend(this, obj)
  }
}

function _path(base, path) {
  return trim(base + '.' + path, '.')
}

function _visitCombinations(combination, path = '') {
  return combination instanceof Combination
    ? combineReducers(
        mapValues(
          combination,
          (next, key) => _visitCombinations(next, _path(path, key))
        )
      )
    : createReducer(combination, path)
}

export function rootReducer(combination) {
  return _visitCombinations(combination)
}

export function combine(obj) {
  return new Combination(obj)
}
