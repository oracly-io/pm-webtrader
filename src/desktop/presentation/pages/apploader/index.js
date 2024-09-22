import React from 'react'

import '@styles/pages/apploader.scss'

const AppLoader = (props) => (
  <div className="app-loader">
      <div>LOADING....</div>
  </div>
)

export default React.memo(AppLoader)
