import logger from '@lib/logger'
import { applySearchParams } from '@oracly/pm-libs/script-src'
import uuidv4 from '@oracly/pm-libs/uuidv4'

import { AUTH, DEMO, DEMO_ADDRESS, ORCY_ADDRESS, WMATIC_ADDRESS } from '@constants'
import { NATIVE } from '@constants'

const required = (value) => {
  if (typeof value === 'undefined') {
    throw new Error('Could not find configuration')
  }
  return value
}

let cfg = {
  automount: true,
  app_name: 'pm-webtrader',
  app_instance_id: 'pm-webtrader:' + uuidv4(),
  debug: process.env.DEBUG,
  env: required(process.env.NODE_ENV),

  application_relaunch_timeout: 5000,
  application_relaunch_attempts: 10,
  application_relaunch_fallback_path: '/maintenance',

  react_mount_element_id: process.env.REACT_MOUNT_ELEMENT_ID,
  apiurl: process.env.WEBAPI_URL,
  pm_base_path: process.env.PM_BASE_PATH,
  st_base_path: process.env.ST_BASE_PATH,
  mt_base_path: process.env.MT_BASE_PATH,
  userdata_url: `${(new URL(location.href)).origin}/userdata`,
  userdata_ava_url: `${(new URL(location.href)).origin}/ava/output`,
  userdata_ava_count: 636,
  chat_ws_url: process.env.CHAT_WS_URL,
  chat_rest_url: process.env.CHAT_REST_URL,
  application_type: process.env.APPLICATION_TYPE,

  chat_reconnect_period: 3000,
  chat_ping_period: 30,

  teron_key: 'AIzaSyBLrhgr-WBoxGl76USEGbqno_wMfli7O94',
  gif_host: 'https://media.tenor.com',

  // application state version
  state_version: 'v1.0.0.prod',
  shared_state_version: 'v1.0.0.prod',

  analytics_enabled: process.env.ANALYTICS_ENABLED,
  // i18n properties {
  default_locale: 'en',
  locize_default_ns: 'common',
  locize_project_id: process.env.LOCIZE_PROJECT_ID,
  locize_api_key: process.env.LOCIZE_API_KEY,
  locize_dev_mode: process.env.LOCIZE_DEV_MODE,
  localizations_resources_url_template: '',
  // }

  persistence_period_short: 1, // days
  persistence_period_long: 28, // days
  persistence_period_instance: 1, // days

  orcy_address: ORCY_ADDRESS,
  demo_address: DEMO_ADDRESS,
  mentoring_address: '0xda4a5d10fd2525b83558f66a24c0c012d67d45a5',
  staking_address: '0x55135638b6301a700070bf08c9b0ef67caf875e4',
  meta_address: '0x9acff323637f765fa770c3d1cdbc76bfbfdb4fa8',
  oraclyv1_address: '0xf41c3bec833bf3b05834b8459ee70816d167cf37',

  vesting_growth: '0x39ee332b91dc58d6ca668bf874df539cae158016',
  vesting_team: '0xd8708ea8214da5a170edac19d9a50c0fffd1b5dc',
  vesting_seed: '0xdd084b37837eb0da72abd817375045d22bf73e93',

  action_tracer: process.env.TRACE_ACTIONS === 'true',

  blockchain_explorer: 'https://polygonscan.com',
  obsolit_data_limit_age: 300,

  round_expiration_notification_ts: 60,

  balance_update: { first: 5, rest: 29 },
  gas_update: { first: 5, rest: 29 },
  allowence_update: { first: 5, rest: 59 },

  default_currency: DEMO,

  GAS_TOKEN: NATIVE.SYMBOL,
  GAS_DECIMALS: NATIVE.DECIMALS,
  low_gas: 1, // 1 MATIC
  suggested_gas: 100, // 100 MATIC
  suggested_swap: 90, // %
  swap_timeout: 5*60*1000, // 5 min
  SWAP_POOL_FACTORY_CONTRACT_ADDRESS: '0x1f98431c8ad98523631ae4a59f267346ea31f984',
  SWAP_FROM_TOKEN_ADDRESS: WMATIC_ADDRESS,
  SWAP_ROUTER_ADDRESS: '0xec7BE89e9d109e7e3Fec59c222CF297125FEFda2',
  QUOTER_CONTRACT_ADDRESS: '0x61ffe014ba17989e743c5f6cb21bf9697530b21e',
  buy_native_token: 'https://www.moonpay.com/buy/matic',

  maximum_fraction_digits: 3,
  maximum_fraction_digits_precent: 1,

  entry_flickering_at: 20,
  entry_hushed_at: 10,

  modal_id: 'app-modal',

  sig_requests: {
    [AUTH]: `
Welcome to Oracly V1!

By signing, you acknowledge the use of the Layer 2 Polygon (PoS) blockchain and Oracly V1 smart contracts, and agree to the game rules outlined in the Oracly Whitepaper (https://oracly.io/?wp=true).
*The signature will be used to authenticate you throughout the system.

By signing this, you confirm that you are at least the legal age required for gambling in your jurisdiction (e.g., 22 years old in Ukraine).

For your security, your authentication status will automatically reset after 30 days.

Rest assured, this signature will not initiate any blockchain transactions or incur any gas fees.

Name
%s

Address
%s

Date
%s
    `.trim(),
  }
}

cfg = applySearchParams(cfg)

cfg.is_development = cfg.env === 'development'
cfg.is_production = cfg.env === 'production'

logger.info('Application Config:', cfg)
export default cfg
