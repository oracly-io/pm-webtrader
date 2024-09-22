import React from 'react'
import cn from 'clsx'
import { useTitle } from 'react-use'
import { isEmpty } from 'lodash'

import { connect } from '@state'
import { getActiveToolbar } from '@state/getters'
import { TOOLBAR_ROUND, TOOLBAR_PREDICTIONS } from '@constants'
import { TOOLBAR_CHAT } from '@constants'

import { useTranslate } from '@lib/i18n-utils'

import Swaper from '@components/Swaper'
import ToolBar from '@components/ToolBar'
import Content from '@components/Content'
import BetBar from '@components/BetBar'
import ActualRoundInfo from '@components/ToolBar/ActualRoundInfo'
import PredictionListWidget from '@components/ToolBar/PredictionListWidget'
import Notifications from '@components/Notifications'
import GameList from '@components/GameList'
import RoundPrizefundsBar from '@components/RoundPrizefundsBar'
import Chat from '@components/ChatWidget/Chat'
import RoundPopover from '@components/RoundPopover'
import Invitation from '@components/Invitation'
import NetworkStatus from '@components/NetworkStatus'
import Online from '@components/Online'

import BlockchainUpdater from '@components/common/BlockchainUpdater'

import css from './WebTrader.module.scss'

const WebTrader = (props) => {
  const t = useTranslate()

  useTitle(t('OraclyV1 Web Trader Platform'))

  return (
    <div className={css.webtrader}>
      <BlockchainUpdater />
      <div className={css.toolbar}>
        <ToolBar />
        <div className={css.bottom}>
          <Online />
          <div className={css.divider} />
          <NetworkStatus />
        </div>
      </div>
      <div className={css.body}>
        <div className={css.content}>
          <Content />
          <RoundPrizefundsBar />
        </div>
      </div>
      <RoundPopover />
      <Swaper />
      {props.activeToolbar === TOOLBAR_ROUND &&
        <div className={css.roundinfo}>
          <ActualRoundInfo />
        </div>
      }
      {props.activeToolbar === TOOLBAR_PREDICTIONS &&
        <div className={css.predictionlistwidget}>
          <PredictionListWidget />
        </div>
      }
      <div className={cn(css.chatwidget, {
        [css.visible]: props.activeToolbar === TOOLBAR_CHAT
      })}>
        <Chat />
      </div>
      <div className={cn(css.betbar, {
        [css.offset]: !isEmpty(props.activeToolbar)
      })}>
        <BetBar />
      </div>
      <GameList />
      <Notifications />
      <Invitation />
    </div>

  )

}

export default connect(
  state => ({
    activeToolbar: getActiveToolbar(state)
  })
)(React.memo(WebTrader))
