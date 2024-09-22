import React from 'react'

import NotFound from '@pages/notfound'
import Master from '@pages/master'
import WebTrader from '@pages/webtrader'

export default [
  {
    path: '',
    element: <Master/>,
    children: [
			{
				index: true,
				element: <WebTrader />
			},
      {
        path: '*',
        element: <NotFound />
      }
    ]
  }
]
