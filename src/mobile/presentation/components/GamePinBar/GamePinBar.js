import React, { useEffect, useMemo, useState, useRef, useCallback } from 'react'
import { map, get, isEmpty } from 'lodash'
import cn from 'clsx'

import { SET_SHOW_GAMES_LIST } from '@actions'

import {
  getPinedGameIds,
  getActiveGameId,
  getGameListIsOpened,
} from '@state/getters'

import { connect } from '@state'

import AddIcon from '@components/SVG/RoundTrackNew'

import Button from '@components/common/Button'

import { useTranslate } from '@lib/i18n-utils'

import StackedGamesList from './StackedGamesList'
import StackedTiles from './StackedTiles'
import ActiveTile from './ActiveTile'
import Tile from './Tile'

import css from './GamePinBar.module.scss'

const GamePinBar = (props) => {
  const innerRef = useRef()
  const outerRef = useRef()
  const t = useTranslate()
  const [showStackedGames, setShowStackedGames] = useState(0)
  const [positionEnd, setPositionEnd] = useState(0)
  const [position, setPosition] = useState(0)

  const onResize = () => {
    if (outerRef.current) {
      setPositionEnd(
        outerRef.current.scrollWidth - outerRef.current.offsetWidth
      )
    }
  }

  useEffect(() => {
    const observer = new ResizeObserver(onResize)
    observer.observe(innerRef.current)
    observer.observe(outerRef.current)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    Math.abs(position) >= positionEnd && setPosition(positionEnd * -1)
  }, [positionEnd])

  const showGamesList = useCallback(() => {
    props.SET_SHOW_GAMES_LIST({ isOpened: !props.isOpened })
  }, [props.isOpened])

  const { activeGame, otherGames } = useMemo(() => {
    let activeGame = {}
    let otherGames = {}

    let entries = Object.entries(props.gameids || {})

    for (let i = 0; i < entries.length; i++) {
      const [currentId, currentValue] = entries[i]

      if (currentId === props.activeGame) {
        activeGame.id = currentValue

        if (i + 1 < entries.length) {
          const [, nextValue] = entries[i + 1]
          activeGame.nextGameId = nextValue
        } else if (i - 1 >= 0) {
          const [, prevValue] = entries[i - 1]
          activeGame.nextGameId = prevValue
        }
      } else {
        otherGames[currentId] = currentValue
      }
    }

    return {
      activeGame,
      otherGames,
    }
  }, [props.gameids, props.activeGame])

  const closeStackedGameList = () => setShowStackedGames(false)
  const prependActive =
    !isEmpty(props.activeGame) &&
    isEmpty(get(props.gameids, [props.activeGame]))

  const otherGamesArray = map(otherGames)

  return (
    <>
      <div className={css.gamepinbar}>
        <div className={css.inner}>
          <div
            ref={outerRef}
            className={css.games}
            style={{ transform: `translateX(${position}px)` }}
          >
            <div ref={innerRef} className={css.container}>
              {prependActive && (
                <ActiveTile key={props.activeGame} gameid={props.activeGame} />
              )}
              {!prependActive && activeGame && (
                <ActiveTile
                  key={activeGame.id}
                  gameid={activeGame.id}
                  nextGameId={activeGame.nextGameId}
                />
              )}
              {/** TODO: here we can have only 1-2 visible games, will be updated when design will be ready */}
              {!isEmpty(otherGamesArray) ? (
                otherGamesArray.length < 3 ? (
                  otherGamesArray.map((gameid) => (
                    <Tile key={gameid} gameid={gameid} />
                  ))
                ) : (
                  <>
                    <Tile
                      key={otherGamesArray[0]}
                      gameid={otherGamesArray[0]}
                    />
                    <StackedTiles
                      onClick={() => {
                        setShowStackedGames(true)
                      }}
                      gameids={otherGamesArray.slice(1)}
                    />
                  </>
                )
              ) : null}
            </div>
          </div>
        </div>

        <Button
          className={cn(css.add, {
            [css.active]: props.isOpened,
          })}
          onClick={showGamesList}
        >
          {Object.keys(props.gameids || {}).length <= 1 && !props.isOpened ? (
            <span>{t('Games')}</span>
          ) : null}
          <AddIcon />
        </Button>
      </div>
      {!isEmpty(otherGamesArray) && otherGamesArray.length > 2 && (
        <div
          className={cn(css.overlay, {
            [css.opened]: showStackedGames,
          })}
        >
          <div
            className={css.closearea}
            onClick={closeStackedGameList}
          />
            <StackedGamesList
              closeStackedGameList={closeStackedGameList}
              gameids={otherGamesArray.slice(1)}
            />
        </div>
      )}
    </>
  )
}

export default connect(
  (state) => ({
    gameids: getPinedGameIds(state),
    activeGame: getActiveGameId(state),
    isOpened: getGameListIsOpened(state),
  }),
  ({ query, command }) => [command(SET_SHOW_GAMES_LIST)]
)(React.memo(GamePinBar))
