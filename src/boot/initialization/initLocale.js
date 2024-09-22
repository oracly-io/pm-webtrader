import logger from '@lib/logger'
import { get } from 'lodash'
import { setLocaleDateFns } from '@oracly/pm-libs/date-utils'

import config from '@config'
import { setLocale } from '@lib/i18n-utils'

export default function initLocale(store) {
  const state = store.getState()
  const locale = get(state, 'locale', config.default_locale)

  logger.info('Initializing locale: %s', locale)

	setLocaleDateFns(locale)
	setLocale(locale)
}

