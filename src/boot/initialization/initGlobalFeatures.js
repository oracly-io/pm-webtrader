import { initForceRefreshBetweenAppsNavigation } from '@oracly/pm-libs/browser-history-utils'
import { init } from '@oracly/pm-libs/date-utils'
import objectAssignPolyfill from '@oracly/pm-libs/object-assign'
import resizeObserverPolyfill from '@oracly/pm-libs/resize-observer'
import { addTouchClass } from '@oracly/pm-libs/touch-detect'
import { addConnectionListener } from '@oracly/pm-libs/network-connection'
import { command } from '@oracly/pm-libs/redux-cqrs'

import config from '@config'

import logger from '@lib/logger'

import { CONNECTION_ESTABLISHED, CONNECTION_LOST } from '@actions'

let initialized = false

export default function initGlobalFeatures (store) {
  if (initialized) return logger.info('Global Features is already initialized')
  logger.info('Initializing global features.')

  init()

  addTouchClass()

  // Add offline listener
  const removeConnectionListener = addConnectionListener(online => {
    const action = online ? CONNECTION_ESTABLISHED : CONNECTION_LOST
    store.dispatch(command(action, online))
  })

  objectAssignPolyfill()
  resizeObserverPolyfill()
  initForceRefreshBetweenAppsNavigation(config)

  initialized = true

  return {
    removeConnectionListener
  }

}
