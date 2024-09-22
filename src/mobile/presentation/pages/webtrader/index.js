import React, { useEffect } from 'react'
import cn from 'clsx'

import { connect } from '@state'
import { getActiveToolbar } from '@state/getters'

import { TOOLBAR_PREDICTIONS, TOOLBAR_ROUND, TOOLBAR_CHAT } from '@constants'

import logger from '@lib/logger'

import AppInstallPrompt from '@components/AppInstallPrompt'
import Swaper from '@components/Swaper'
import ActualRoundInfo from '@components/ActualRoundInfo'
import ActualRoundInfoWidget from '@components/ActualRoundInfoWidget'
import Content from '@components/Content'
import Notifications from '@components/Notifications'
import PredictionListWidget from '@components/PredictionListWidget'
import RoundPopover from '@components/RoundPopover'
import GameList from '@components/GameList'
import BetBar from '@components/BetBar'
import Chat from '@components/ChatWidget/Chat'

import BlockchainUpdater from '@components/common/BlockchainUpdater'
import GlobalHeader from '@components/GlobalHeader'
import Invitation from '@components/Invitation'

import css from '@styles/pages/webtrader.module.scss'

const WebTrader = (props) => {
  useEffect(() => {
    if (screen.orientation && screen.orientation.lock) {
      screen.orientation.lock('portrait').catch(function (error) {
        logger.warn('Orientation lock failed: ', error)
      })
    }
  }, [])

  return (
    <GlobalHeader>
      <div className={css.webtrader}>
        <BlockchainUpdater />
        <div className={css.body}>
          <div className={css.content}>
            <Content />
          </div>
        </div>
        <div className={css.betbar}>
          <BetBar />
        </div>
        <Swaper />
        <AppInstallPrompt />
        <RoundPopover />
        <div
          className={cn(css.widget, {
            [css.visible]: props.activeToolbar === TOOLBAR_PREDICTIONS,
          })}
        >
          <PredictionListWidget />
        </div>
        <div
          className={cn(css.widget, {
            [css.visible]: props.activeToolbar === TOOLBAR_ROUND,
          })}
        >
          <ActualRoundInfoWidget />
        </div>
        <div
          className={cn(css.widget, {
            [css.visible]: props.activeToolbar === TOOLBAR_CHAT,
          })}
        >
          <Chat />
        </div>
        <GameList />
        <Notifications />
        <ActualRoundInfo />
        <Invitation />
      </div>
    </GlobalHeader>
  )
}

export default connect((state) => ({
  activeToolbar: getActiveToolbar(state),
}))(React.memo(WebTrader))
