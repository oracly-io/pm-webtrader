import logger from '@lib/logger'
import pmwebapi from '@oracly/pm-libs/pm-api-client'

import config from '@config'


export function setUserId(userid) {
  logger.info('NOTHING: Set User Id Dimention "%s"', userid)
}

export function gaPageView(path, title) {
  logger.info('NOTHING: Send PageView')
}

export function gaEvent(action, label, category = 'OraclyV1') {
  logger.info('NOTHING: Send Event')
}

export default analytics
