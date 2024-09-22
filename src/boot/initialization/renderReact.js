import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import { WalletProvider } from '@oracly/pm-libs/crypto-wallet'

import config from '@config'
import logger from '@lib/logger'

import routing from '@routing'

import * as serviceWorkerRegistration from './serviceWorkerRegistration'

const router = createBrowserRouter(routing, { basename: config.pm_base_path })

export default function renderReact(store, domelement) {
  logger.info('Rendering React Application')
  ReactDOM.render(
    <WalletProvider>
      <Provider store={store}>
        <RouterProvider router={router} />
      </Provider>
    </WalletProvider>,
    domelement
  )
}

serviceWorkerRegistration.register()
