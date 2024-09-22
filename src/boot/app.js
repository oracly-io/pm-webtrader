import { delay } from 'lodash'
import Modal from 'react-modal'
import { command } from '@oracly/pm-libs/redux-cqrs'

import config from '@config'
import logger from '@lib/logger'

import { mount } from '@state'
import { APPLICATION_BOOTING, APPLICATION_INITIALIZED } from '@state/actions'

import initGlobalFeatures from './initialization/initGlobalFeatures'
import initLocale from './initialization/initLocale'
import renderReact from './initialization/renderReact'
import initClients from './initialization/initClients'
import initSockets from './initialization/initSockets'
import initActionsScheduler from './initialization/initActionsScheduler'
import initSupportBot from './initialization/initSupportBot'

let attempts = 1
let initialized = false

const boot = (el) => {
  logger.info('Booting OraclyV1 Web Interface!')

  const { store } = mount()

  store.dispatch(command(APPLICATION_BOOTING))

  initClients()
  initSockets(store)
  initLocale(store)
  initGlobalFeatures(store)
  initActionsScheduler(store)
  initSupportBot(store)

  store.dispatch(command(APPLICATION_INITIALIZED))
  initialized = true

  Modal.setAppElement(el)

  // XXX: React should go last, it's rendering applicaion
  renderReact(store, el)
}

const AppBoot = async (mount_element_id) => {
  const el = document.getElementById(mount_element_id)
  try {
    boot(el)
    attempts = 1
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error)
    logger.info('Rebooting application attempt: %s', attempts++)
    delay(() => AppBoot(mount_element_id), config.application_relaunch_timeout)

    if (attempts > config.application_relaunch_attempts) {
      window.location.href = config.application_relaunch_fallback_path
    }
  }
}

const bootHandler = (event) => {
  const message = event.data
  if (message.mount_application !== config.app_name) return
  if (message.mount_element_id) {
    if (!initialized) {
      AppBoot(message.mount_element_id)
    } else {
      logger.info('Applicaion is already initialized')
    }
  } else {
    logger.info('missing mount element id: ', message)
  }
}

window.addEventListener('message', bootHandler, false)
if (config.automount) {
  window.postMessage(
    {
      mount_application: config.app_name,
      mount_element_id: config.react_mount_element_id,
    },
    '*'
  )
}

if (process.env.NODE_ENV === 'development') {
  localStorage.debug = '*'
}
