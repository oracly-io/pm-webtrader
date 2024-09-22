import React, { useEffect, useState, useRef, useCallback } from 'react'
import { map, get, isEmpty } from 'lodash'
import cn from 'clsx'

import { SET_SHOW_GAMES_LIST } from '@actions'

import { getPinedGameIds, getActiveGameId, getGameListIsOpened } from '@state/getters'

import { connect } from '@state'

import AddIcon from '@components/SVG/RoundTrackNew'
import ArrowNextIcon from '@components/SVG/RoundTrackArrowNext'
import ArrowPrevIcon from '@components/SVG/RoundTrackArrowPrev'
import Button from '@components/common/Button'
import Payout from '@components/Payout'
import Demo1000 from '@components/Demo1000'

import Tile from './Tile'

import css from './GamePinBar.module.scss'

const SCROLL_DISTANCE = 160

const GamePinBar = (props) => {
  const innerRef = useRef()
  const outerRef = useRef()

  const [position, setPosition] = useState(0)
  const [positionEnd, setPositionEnd] = useState(0)

  const onLeftArrow = () => position + SCROLL_DISTANCE < 0
    ? setPosition(position + SCROLL_DISTANCE)
    : setPosition(0)
  const onRightArrow = () => Math.abs(position - SCROLL_DISTANCE) < positionEnd
    ? setPosition(position - SCROLL_DISTANCE)
    : setPosition(positionEnd * -1)

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

  const prependActive = !isEmpty(props.activeGame) &&
    isEmpty(get(props.gameids, [props.activeGame]))

  return (
    <div className={css.gamepinbar}>

      <div className={css.inner}>

        <div
          ref={outerRef}
          className={css.games}
          style={{ transform: `translateX(${position}px)` }}
        >
          <div
            ref={innerRef}
            className={css.container}
          >
            {prependActive &&
              <Tile
                key={props.activeGame}
                gameid={props.activeGame}
              />
            }
            {map(props.gameids, gameid =>
              <Tile
                key={gameid}
                gameid={gameid}
              />
            )}
          </div>
        </div>

        {position < 0 &&
          <div className={css.arrowleft}>
            <Button className={css.arrow} onClick={onLeftArrow}>
              <ArrowPrevIcon />
            </Button>
          </div>
        }

        {Math.abs(position) < positionEnd &&
          <div className={css.arrowright}>
            <Button className={css.arrow} onClick={onRightArrow}>
              <ArrowNextIcon />
            </Button>
          </div>
        }

      </div>

      <Button
        className={cn({ [css.add]: !props.isOpened, [css.close]: props.isOpened })}
        onClick={showGamesList}
      >
        <AddIcon />
      </Button>

      <div className={css.income}>
        <Demo1000 />
        <Payout />
      </div>

    </div>
  )

}

export default connect(
  state => ({
    gameids: getPinedGameIds(state),
    activeGame: getActiveGameId(state),
    isOpened: getGameListIsOpened(state),
  }),
  ({ query, command }) => [
    command(SET_SHOW_GAMES_LIST),
  ]
)(React.memo(GamePinBar))
