import i18next from 'i18next'
import logger from '@lib/logger'
// TODO @Dmitriy Kondratenko Repalce
// Replace import LocizeEditor from 'locize-editor' to import { locizePlugin } from 'locize';
import LocizeEditor from 'locize-editor'
import LocizeBackend from 'i18next-http-backend'
import { initReactI18next } from 'react-i18next'


import config from '@config'

const i18nDevConfig = {
  fallbackLng: false,
  ns: [config.locize_default_ns],
  defaultNS: config.locize_default_ns,
  nsSeparator: false,
  keySeparator: false,
  saveMissing: false,
  load: 'languageOnly',
  editor: {
    mode: 'iframe',
    iframeContainerStyle:
      'z-index: 1000; position: fixed; top: 0; right: 0; bottom: 0; width: 550px; box-shadow: -3px 0 5px 0 rgba(0,0,0,0.5);',
    iframeStyle: 'height: 100%; width: 550px; border: none;',
    bodyStyle: 'width: calc(100% - 550px); position: relative;',
    onEditorSaved: function (lng, ns) {
      i18next.reloadResources(lng, ns)
    },
  },
  backend: {
    projectId: config.locize_project_id,
    loadPath: `https://api.locize.io/${config.locize_project_id}/latest/{{lng}}/${config.locize_default_ns}`,
    addPath: `https://api.locize.io/missing/${config.locize_project_id}/latest/{{lng}}/${config.locize_default_ns}`,
    crossDomain: true,
    withCredentials: false,
    allowMultiLoading: false,
    customHeaders: { Authorization: `Bearer ${config.locize_api_key}` },
  },
  react: {
    wait: true,
    useSuspense: false,
  }
}

export function init() {
  logger.info('Initialize i18next in Locize Dev Mode')

  i18next
    .use(initReactI18next)
    .use(LocizeEditor)
    .use(LocizeBackend)
    .init(i18nDevConfig)
}
