import React from 'react'
import PropTypes from 'prop-types'
import cn from 'clsx'
import { indexOf, isEmpty } from 'lodash'

import { DOWN, UP, EQUAL, NOCONTEST } from '@constants'
import { isNoContestEmptyRound } from '@utils'
import { isHistoricalRound } from '@utils'

import { PriceHide } from '../Price'
import OpenPrice from '../OpenPrice'
import VerifiedResolution from '../VerifiedResolution/VerifiedResolution'
import UnverifiedResolution from '../UnverifiedResolution/UnverifiedResolution'
import VerifiedOutcome from '../VerifiedOutcome/VerifiedOutcome'
import UnverifiedOutcome from '../UnverifiedOutcome/UnverifiedOutcome'

import css from './RoundResolution.module.scss'

const RoundResolution = ({
  className,
  headerClassName,
  detailsClassName,
  round,
  game,
  settlment,
  unverifiedResolution,
}) => {

  const historical = isHistoricalRound(round, settlment)
  const emptyround = isNoContestEmptyRound(round)
  const showOpenPrice = !!round.entryPriceValue

  const showVerifiedPrice = round.resolved && round.exitPriceValue && historical
  const showUnverifiedPrice = !round.resolved && !isEmpty(settlment) && !emptyround && historical
  const showVerifiedOutcome = round.resolved && !!~indexOf([NOCONTEST, UP, DOWN, EQUAL], round.resolution) && historical
  const showUnverifiedOutcome = !round.resolved && !!~indexOf([NOCONTEST, UP, DOWN, EQUAL], unverifiedResolution) && historical

  const showVerified = !!(showVerifiedPrice && showVerifiedOutcome)
  const showUnverified = !!(showUnverifiedPrice && showUnverifiedOutcome)

  if (!showOpenPrice && !showVerifiedPrice && !showUnverifiedPrice && !showVerifiedOutcome && !showUnverifiedOutcome) return null

  return (
    <div className={(cn(css.container, className))}>

        {showOpenPrice && (
          <OpenPrice
            detailsClassName={detailsClassName}
            round={round}
            game={game}
          />
        )}

        {showVerified && (
          <VerifiedResolution
            headerClassName={headerClassName}
            detailsClassName={detailsClassName}
            round={round}
            game={game}
          />
        )}

        {showUnverified && (
          <UnverifiedResolution
            headerClassName={headerClassName}
            detailsClassName={detailsClassName}
            game={game}
            settlment={settlment}
            unverifiedResolution={unverifiedResolution}
          />
        )}

        {showVerifiedOutcome && (
          <VerifiedOutcome
            headerClassName={headerClassName}
            detailsClassName={detailsClassName}
            round={round}
          />
        )}

        {showUnverifiedOutcome && (
          <UnverifiedOutcome
            headerClassName={headerClassName}
            detailsClassName={detailsClassName}
            unverifiedResolution={unverifiedResolution}
          />
        )}

        <PriceHide />

    </div>
  )
}

RoundResolution.propTypes = {
  className: PropTypes.string,
  headerClassName: PropTypes.string,
  round: PropTypes.object,
  game: PropTypes.object,
  settlment: PropTypes.object,
  unverifiedResolution: PropTypes.number,
}

export default RoundResolution
