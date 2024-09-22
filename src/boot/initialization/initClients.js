import logger from '@lib/logger'
import { PriceFeedApi } from '@oracly/pm-libs/pm-api-client'
import { ChatApi, UserApi } from '@oracly/pm-libs/pm-api-client'

import config from '@config'

export default function initClients() {
  logger.info('Init clients')

  PriceFeedApi.baseUrl = config.apiurl
  ChatApi.baseUrl = config.chat_rest_url
  UserApi.baseUrl = config.userdata_url

}
