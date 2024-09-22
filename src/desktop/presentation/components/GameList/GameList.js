import React, { useEffect, useCallback } from 'react'
import cn from 'clsx'
import { hexHash } from '@oracly/pm-libs/hash-utils'

import { useTransition } from '@hooks'

import Button from '@components/common/Button'
import CloseIcon from '@components/SVG/RoundListClose'

import { connect } from '@state'
import { GET_GAMES, SET_SHOW_GAMES_LIST } from '@state/actions'
import { getGameListFilter } from '@state/getters'
import { getGameListIsOpened } from '@state/getters'
import { getActiveCurrency } from '@state/getters'

import GameListGames from './GameListGames'
import GameListOptions from './GameListOptions'

import css from './GameList.module.scss'

const GameList = (props) => {
  useEffect(() => {
    props.GET_GAMES({ listname: null, filter: { currency: props.currency } })
  }, [props.currency])

  useEffect(() => {
    props.GET_GAMES({ listname: props.listname, filter: props.filter })
  }, [props.listname])

  const closeGameList = useCallback(() => {
    props.SET_SHOW_GAMES_LIST({ isOpened: false })
  }, [])

  const timeout = 100 //ms
  const [mount, opening] = useTransition(props.isOpened, timeout)

  if (!mount) return null

  return (
    <div className={cn(css.gamelist, { [css.opened]: opening })}>
      <div className={css.content}>

        <Button className={css.close} onClick={closeGameList}>
          <CloseIcon />
        </Button>

        <GameListOptions />
        <GameListGames />

      </div>
      <div onClick={closeGameList} className={css.closeOverlay}/>
    </div>
  )
}

export default connect(
  (state) => {
    const filter = getGameListFilter(state)
    const listname = hexHash(filter)

    return {
      filter,
      listname,

      isOpened: getGameListIsOpened(state),
      currency: getActiveCurrency(state),
    }
  },
  ({ query, command }) => [query(GET_GAMES), command(SET_SHOW_GAMES_LIST)]
)(React.memo(GameList))
