import React from 'react'
import { map } from 'lodash'
import { hexHash } from '@oracly/pm-libs/hash-utils'

import { connect } from '@state'
import { getGameIdsByListName, getGameListFilter } from '@state/getters'

import Game from '../Game'

import css from './GameListGames.module.scss'

const GameListGames = (props) => {

  return (
    <div className={css.container}>
      <div className={css.rounds}>
        {map(props.gameids, (gameid) => (
          <Game key={gameid} gameid={gameid} search={props.search} onClick={props.closeGameList} />
        ))}
      </div>
    </div>
  )
}

export default connect((state) => {
  const filter = getGameListFilter(state)
  const listname = hexHash(filter)

  return {
    gameids: getGameIdsByListName(state, listname),
  }
})(React.memo(GameListGames))
