import { useRef, useEffect, useCallback } from 'react'

export function useSupportBot() {

  const bot = document.getElementById('BOT-wrapper')

  const toggle = useCallback(() => {
    // NOTE: make bot active only when statistics bar is open
    if (!window.BOT || !bot) {
      console.warn('Support AI Agent is still loading...') // eslint-disable-line
      return
    }

    if (!bot.classList.contains('active')) {
      bot.classList.add('active')
      window.BOT('open')
    } else {
      bot.classList.remove('active')
      window.BOT('close')
    }

  }, [bot, window.BOT])

  const onclose = useCallback((event) => {
    const widgetOrigin = 'https://widget.writesonic.com'
    if (event.origin !== widgetOrigin) return

    try {
      const data = JSON.parse(event.data)
      if (data.message === 'widget-expanded' && data.value === false) {
        bot.classList.remove('active')
        window.BOT('close')
      }
    } catch (e) {
      console.warn('Support AI Agent is corrupted...') // eslint-disable-line
      bot.classList.remove('active')
      window.BOT('close')
    }

  }, [toggle, window.BOT, bot])

  const botlistener = useRef()
  useEffect(() => {
    if (!window.BOT || !bot) return

    if (botlistener.current && botlistener.current !== onclose) {
      window.removeEventListener('message', botlistener.current)
    }

    window.addEventListener('message', onclose)
    botlistener.current = onclose

  }, [onclose, window.BOT, bot])

  return [toggle, window.BOT, bot]
}
