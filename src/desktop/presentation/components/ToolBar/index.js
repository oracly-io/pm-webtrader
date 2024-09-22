import React from 'react'
import cn from 'clsx'
import { map } from 'lodash'

import ButtonProvider from '@components/common/Button'
import UsersIcon from '@components/SVG/Users'
import DoubleArrowsIcon from '@components/SVG/DoubleArrows'
import ChatIcon from '@components/SVG/Chat'

import { connect } from '@state'
import { getActiveToolbar } from '@state/getters'
import { getActiveAccountAddress } from '@state/getters'

import { TOGGLE_TOOLBAR } from '@actions'

import { TOOLBAR_ROUND, TOOLBAR_PREDICTIONS } from '@constants'
import { TOOLBAR_CHAT } from '@constants'

import css from './ToolBar.module.scss'

const ToolBar = (props) => {

  const sections = [
    { type: TOOLBAR_ROUND, Icon: UsersIcon, enabled: true },
    { type: TOOLBAR_PREDICTIONS, Icon: DoubleArrowsIcon, enabled: !!props.bettor },
    { type: TOOLBAR_CHAT, Icon: ChatIcon, enabled: !!props.bettor },
  ]

  return (
    <div className={css.toolbar}>
      <ul className={css.menu}>
        {map(sections, ({ type, Icon, enabled }) => enabled &&
          <li
            key={type}
            className={cn(css.item, { [css.selected]: props.active === type })}
          >
            <ButtonProvider
              className={css.button}
              onClick={() => props.TOGGLE_TOOLBAR({ type })}
            >
              {Icon && <Icon />}
            </ButtonProvider>
          </li>
        )}
      </ul>
    </div>
  )

}

export default connect(
  state => ({
    active: getActiveToolbar(state),
    bettor: getActiveAccountAddress(state),
  }),
  ({ command }) => [
    command(TOGGLE_TOOLBAR),
  ]
)(React.memo(ToolBar))
