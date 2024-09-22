import i18next from 'i18next'
import { initReactI18next, useTranslation } from 'react-i18next'
import { forEach, defer } from 'lodash'
import logger from '@lib/logger'

import languages from '@languages'
import config from '@config'


if (process.env.LOCIZE_DEV_MODE && process.env.NODE_ENV === 'development') {
  const { init } = require('./dev-mode')
  init()
} else {
  logger.info('Initialize i18next in Production Mode')

  const i18nConfig = {
    fallbackLng: config.default_locale,
    ns: [config.locize_default_ns],
    defaultNS: config.locize_default_ns,
    nsSeparator: false,
    keySeparator: false,
    react: {
      wait: true,
      useSuspense: false,
    }
  }

  if (config.localizations_resources_url_template) {
    i18nConfig.backend = {
      loadPath: config.localizations_resources_url_template,
      crossDomain: true,
      withCredentials: false,
      allowMultiLoading: false,
    }
  }

  i18next.use(initReactI18next)
    .init(i18nConfig)

  forEach(languages, (namespaces, language) => {
    forEach(namespaces, (resource, namespace) => {
      logger.info('Language resources found:', language)
      i18next.addResourceBundle(language, namespace, resource)
    })
  })
}

function registerLanguageChanged(callback) {
  i18next.on('languageChanged', (lng) => {
    logger.info('Language Changed', lng)
    callback()
  })
}

function registerLanguageLoaded(callback) {
  i18next.on('loaded', (loaded) => {
    logger.info('Resources Loaded')
    defer(callback, loaded)
  })
}

function setLocale(localeSlug) {
  if (localeSlug === i18next.language) return
  logger.info('Set locale %s', localeSlug)
  i18next.changeLanguage(localeSlug)
}

function getLocale(localeSlug) {
  return i18next.language
}

function useTranslate() {
  const { t } = useTranslation()
  return t
}

export {
  setLocale,
  getLocale,
  registerLanguageChanged,
  registerLanguageLoaded,
  useTranslate
}
