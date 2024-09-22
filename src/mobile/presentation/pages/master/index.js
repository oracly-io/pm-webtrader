import React from 'react'
import { Outlet } from 'react-router-dom'
import cn from 'clsx'

import config from '@config'
import { DARK_THEME } from '@constants'
import { connect } from '@state'
import { getTheme } from '@state/getters/application'

import css from '@styles/pages/master.module.scss'
import '@styles/app.scss'

const Master = (props) => {
  return (
    <div
      className={cn(css.master, {
        dark: props.theme === DARK_THEME,
      })}
    >
      <Outlet />
      <div id={config.modal_id} />
    </div>
  )
}

export default connect((state) => ({
  theme: getTheme(state),
}))(React.memo(Master))
