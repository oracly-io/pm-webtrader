import React from 'react'
import { Outlet } from 'react-router-dom'
import cn from 'clsx'

import config from '@config'
import { connect } from '@state'
import { getTheme } from '@state/getters/application'

import { DARK_THEME } from '@constants'
import GlobalHeader from '@components/GlobalHeader'

import '@styles/app.scss'
import css from '@styles/pages/master.module.scss'

const Master = (props) => (
  <div
    className={cn(css.master, { dark: props.theme === DARK_THEME })}
  >
    <GlobalHeader>
      <Outlet/>
    </GlobalHeader>
    <div id={config.modal_id} />
  </div>
)

export default connect(
  state => ({
    theme: getTheme(state)
  })
)(React.memo(Master))
