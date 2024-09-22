import React from 'react'
import PropTypes from 'prop-types'
import { isEmpty } from 'lodash'

import LevelTag from '@components/common/LevelTag'

import { connect } from '@state'
import { getGameById } from '@state/getters'

import Coin from '../Coin'
import css from './StackedTiles.module.scss'

const StackedTiles = (props) => {
  const games = props.games
  const gameOnTop = games[0]
  if (isEmpty(gameOnTop)) return null

  return (
    <div className={css.container} onClick={props.onClick}>
      <LevelTag game={gameOnTop} className={css.level} short />
      <Coin game={gameOnTop} />
      {games[1] ? <Coin game={games[1]} className={css.stacked} /> : null}
      {games[2] ? <Coin game={games[2]} className={css.stacked} /> : null}
    </div>
  )
}

StackedTiles.propTypes = {
  gameids: PropTypes.array.isRequired,
  onClick: PropTypes.func,
}

export default connect((state, props) => {
  const games = props.gameids.map((gameid) => getGameById(state, gameid))
  return {
    games,
  }
})(React.memo(StackedTiles))
