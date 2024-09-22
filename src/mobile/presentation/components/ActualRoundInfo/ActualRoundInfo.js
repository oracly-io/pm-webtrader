import React, { useEffect, useMemo, useState } from 'react'
import cn from 'clsx'
import { isEmpty, values } from 'lodash'

import { TOOLBAR_ROUND } from '@constants'
import { PRIZEFUNDS } from '@constants'
import { DOWN, UP, EQUAL } from '@constants'

import RoundPrizefundsBar from '@components/RoundPrizefundsBar'
import Avatar from '@components/common/Avatar'
import UsersIcon from '@components/SVG/Users'
import WageredDownIcon from '@components/SVG/WageredDownIcon'
import WageredUpIcon from '@components/SVG/WageredUpIcon'
import WageredZeroIcon from '@components/SVG/WageredZeroIcon'
import { factoryFunds } from '@components/SVG/currency/funds'

import { TOGGLE_TOOLBAR } from '@actions'

import { connect } from '@state'
import { getActiveCurrency } from '@state/getters'
import { getActiveGameId, getActualRound } from '@state/getters'
import { getRoundTopBettorPredictions } from '@state/getters'

import css from './ActualRoundInfo.module.scss'

const ActualRoundInfo = (props) => {
  const { round, bettors, currency } = props

  const predictions = values(bettors).reverse()

  const [latestPredictions, setLatestPredictions] = useState([])
  const [stackedPredictions, setStackedPredictions] = useState([])

  const [newestChunk,stackedChunk] = useMemo(() => {
    const clonedArray = [...predictions]

    const newestChunk = clonedArray.slice(0, 3)

    clonedArray.splice(0, 3)

    const stackedChunk = clonedArray.slice(0, 3)

    return [newestChunk, stackedChunk]
  }, [bettors])

  useEffect(() => {
    if (isEmpty(round) || isEmpty(bettors)) {
      setLatestPredictions([])
      setStackedPredictions([])

      return
    }

    const list = document.getElementById('bettor-list')

    const items = list.getElementsByTagName('a')
    // Add classname with animation to old elements of list
    Array.from(items).forEach((item) => {
      item.classList.add(css.shifted)
    })

    const stackedList = document.getElementById('stacked-list')

    const stackedItems = stackedList.getElementsByTagName('a')
    Array.from(stackedItems).forEach((item) => {
      item.classList.add(css.stackedshifted)
    })

    // To let animation pass before adding new element we need to wait for 500ms
    const timeoutId = setTimeout(() => {
      setStackedPredictions(() => stackedChunk)

      setLatestPredictions(() => newestChunk)
      // Remove classname with animation to old elements of list
      Array.from(items).forEach((item) => {
        item.classList.remove(css.shifted)
      })
      Array.from(stackedItems).forEach((item) => {
        item.classList.remove(css.stackedshifted)
      })
    }, 550)

    return () => {
      clearTimeout(timeoutId)
    }
  }, [newestChunk, stackedChunk])

  const Currency = factoryFunds(currency)

  const openRound = () => props.TOGGLE_TOOLBAR({ type: TOOLBAR_ROUND })
  if (isEmpty(round) || isEmpty(bettors)) return null

  return (
    <div className={css.container}>
      <div className={css.prizefunds}>
        <RoundPrizefundsBar />
      </div>
      <div className={cn(css.block, css.prizefund)} onClick={openRound}>
        <div className={css.currency}>
          <Currency />
        </div>
        <span>{Number(round?.prizefunds?.[PRIZEFUNDS.TOTAL])}</span>
      </div>
      <div className={cn(css.block, css.bettorscount)} onClick={openRound}>
        <UsersIcon />
        <span>{round.bettors}</span>
      </div>
      <div id="bettor-list" className={css.bettorlist}>
        {latestPredictions.map((prediction, index) => (
          <div className={css.bettorContainer} key={prediction.id}>
            <div className={css.avatarContainer}>
              <Avatar className={css.bettor} address={prediction.bettor} />
              <div className={css.wagerPosition}>
                {prediction.position === UP && <WageredUpIcon />}
                {prediction.position === DOWN && <WageredDownIcon />}
                {prediction.position === EQUAL && <WageredZeroIcon />}
              </div>
            </div>
            {index === 0 ? (
              <div className={css.difference}>
                <span className={css.wager}>+{prediction.wager}</span>
                <div className={css.currency}>
                  <Currency />
                </div>
              </div>
            ) : null}
          </div>
        ))}
      </div>
      <div id="stacked-list" className={css.stacked}>
        {stackedPredictions.map((prediction, index) => {
          const first = index === 0
          return (
            <div className={css.avatarContainer} key={prediction.id}>
              <Avatar
                className={cn(css.stackedbettor, {
                  [css.first]: first,
                  [css.second]: index === 1,
                  [css.third]: index === 2,
                })}
                address={prediction.bettor}
              />
              {first && (
                <div className={css.wagerPosition}>
                  {prediction.position === UP && <WageredUpIcon />}
                  {prediction.position === DOWN && <WageredDownIcon />}
                  {prediction.position === EQUAL && <WageredZeroIcon />}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default connect(
  (state) => {
    const round = getActualRound(state, getActiveGameId(state))
    const currency = getActiveCurrency(state)

    return {
      round,
      bettors: getRoundTopBettorPredictions(state, round.roundid),
      currency,
    }
  },
  ({ command }) => [command(TOGGLE_TOOLBAR)]
)(React.memo(ActualRoundInfo))
