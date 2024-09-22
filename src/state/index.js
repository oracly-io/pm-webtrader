import { createStore, applyMiddleware, compose } from 'redux'
import { get, isFunction, isEqual } from 'lodash'
import { connect as reduxConnect } from 'react-redux'
import { interceptorMiddleware } from '@oracly/pm-libs/action-interceptor'
import { cqrsMiddleware, connectDecorator } from '@oracly/pm-libs/redux-cqrs'
import Persistence from '@oracly/pm-libs/persistence-js'

import asynchronous from '@asynchronous'
import interceptors from '@interceptors'

import logger from '@lib/logger'

import reducer from '@state/reducer'
import config from '@config'


export function mount() {
  logger.info('Mount Application State.')

  logger.info('Initializing Persistence')
  const persistedStore = Persistence.init({
    appName: config.app_name + config.state_version,
    invalidate: [config.app_name],
    storageId: config.app_name,
    storages: {
      instance: {
        storageId: config.app_instance_id,
        lifeTime: config.persistence_period_instance,
      },
      long: {
        lifeTime: config.persistence_period_long,
      },
      short: {
        lifeTime: config.persistence_period_short,
      },
      shared: {
        appName: 'apps' + config.shared_state_version,
        lifeTime: config.persistence_period_long,
        storageId: 'apps',
      }
    }
  })

  let _compose = compose
  if (
    config.is_development &&
    isFunction(window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__)
  ) {
    _compose = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
  }

  const store = createStore(
    reducer,
    persistedStore,
    _compose(applyMiddleware(
      cqrsMiddleware(asynchronous),
      interceptorMiddleware(interceptors),
    ))
  )

  return { store }
}

export function connect(stateMapper, dispatchMapper, merge, options) {
  const areStatePropsEqual = (next, prev) => isEqual(prev, next)
  options = isFunction(get(options, 'areStatePropsEqual')) ? options : { ...options, areStatePropsEqual }

  return connectDecorator(reduxConnect, stateMapper, dispatchMapper, merge, options)
}
