import React from 'react'

import { SET_ACTIVE_GAME } from '@actions'

import { useTranslate } from '@lib/i18n-utils'

import { connect } from '@state'

import Button from '@components/common/Button'
import CloseIcon from '@components/SVG/RoundListClose'
import Game from '@components/GameList/Game'

import css from './StackedGamesList.module.scss'

const StackedGamesList = (props) => {
  const t = useTranslate()

  return (
    <div className={css.container}>
      <div className={css.titleContainer}>
        <span className={css.title}>{t('Open Games')}</span>
        <Button className={css.close} onClick={props.closeStackedGameList}>
          <CloseIcon />
        </Button>
      </div>
      <div className={css.gameList}>
        {props.gameids.map((gameid) => (
          <Game
            key={gameid}
            gameid={gameid}
            onClick={props.closeStackedGameList}
          />
        ))}
      </div>
    </div>
  )
}

export default connect(
  () => null,
  ({ command }) => [command(SET_ACTIVE_GAME)]
)(React.memo(StackedGamesList))
