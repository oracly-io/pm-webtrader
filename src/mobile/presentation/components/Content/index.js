import React from 'react'

import Chart from '@components/Content/Chart'

import PriceFeedScrollToNow from './PriceFeedScrollToNow'
import DataSyncModal from './DataSyncModal'

import css from '@styles/components/content/index.module.scss'

const Content = (props) => {

  return (
    <main className={css.content}>
      <Chart/>
      <PriceFeedScrollToNow />
      <DataSyncModal />
    </main>
  )

}

export default React.memo(Content)
