import React, { useState } from 'react'
import { map } from 'lodash'
import { hexHash } from '@oracly/pm-libs/hash-utils'

import { useTranslate } from '@lib/i18n-utils'

import { connect } from '@state'
import { getGameIdsByListName, getGameListFilter } from '@state/getters'

import Game from '../Game'
import SearchBar from '../SearchBar'

import css from './GameListGames.module.scss'

const GameListGames = (props) => {

  const t = useTranslate()

  const [search, setSearch] = useState('')

  return (
    <div className={css.container}>

      <div className={css.title}>{t('Games')}</div>

      <SearchBar onSearch={setSearch} />

      <div className={css.rounds}>
        {map(props.gameIds, gameid =>
          <Game
            key={gameid}
            gameid={gameid}
            search={search}
          />
        )}
      </div>

    </div>
  )
}

export default connect(
  (state) => {
    const filter = getGameListFilter(state)
    const listname = hexHash(filter)

    return {
      gameIds: getGameIdsByListName(state, listname),
    }
  }
)(React.memo(GameListGames))
