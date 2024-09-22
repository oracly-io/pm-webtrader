import { command } from '@oracly/pm-libs/redux-cqrs'
import logger from '@lib/logger'
import { SUPPORTBOT_ONLINE } from '@actions'

export default function initSupportBot (store) {

  (function (w, d, s, o, f, js, fjs) {
    w['botsonic_widget'] = o
    w[o] =
      w[o] ||
      function () {
        (w[o].q = w[o].q || []).push(arguments)
      };
    (js = d.createElement(s)), (fjs = d.getElementsByTagName(s)[0])
    js.id = o
    js.src = f
    js.async = 1
    fjs.parentNode.insertBefore(js, fjs)
  })(
    window,
    document,
    'script',
    'BOT',
    'https://widget.botsonic.com/CDN/botsonic.min.js'
  )

  window.BOT('init', {
    serviceBaseUrl: 'https://api-azure.botsonic.ai',
    token: '90baaadf-3cbe-4a59-a248-51ac2fc1bc0e',
  })

  store.dispatch(command(SUPPORTBOT_ONLINE))
  logger.info('Support bot initialized!')
}
