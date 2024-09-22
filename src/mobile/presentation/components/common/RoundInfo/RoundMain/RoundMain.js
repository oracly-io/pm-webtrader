import React from 'react'
import PropTypes from 'prop-types'
import cn from 'clsx'
import { formatDistanceUnixTS, formattedUnixTS, toLocalStringUnixTS } from '@oracly/pm-libs/date-utils'
import { nowUnixTS } from '@oracly/pm-libs/date-utils'

import { PRICEFEED } from '@constants'

import { factoryByCurrency } from '@components/SVG/currency'
import AnimatedTimer from '@components/common/Timer/Animated'
import OpenInNewTab from '@components/SVG/OpenInNewTab'
import LockTimerIcon from '@components/SVG/RoundTrackTileLockTimer.White'
import Countdown from '@components/common/Timer/Countdown'
import RefreshTimerWhiteIcon from '@components/SVG/RoundTrackTileRefreshTimer.White'
import { useRenderAt } from '@hooks'

import css from './RoundMain.module.scss'

const RoundMain = ({
  className,
  round,
  game,
}) => {

  useRenderAt(round.endDate)
  useRenderAt(round.lockDate)

  const isActual = round.endDate > nowUnixTS()
  const locked = round.lockDate <= nowUnixTS()
  const resolutionDuration = game.schedule - game.positioning

  const From = factoryByCurrency(game.base)

  return (
    <div className={cn(css.container, className)}>
      <div className={css.main}>

        <div className={css.event}>
          <div className={css.flags}>
            <From />
          </div>
          <div className={css.title}>
            <div className={css.subtitle}>
              {formatDistanceUnixTS(0, resolutionDuration)}
            </div>
            <div className={cn(css.name, css.pricefeed)}>
              <a
                className={cn(css.icon, css.link)}
                href={PRICEFEED.CL_URL[game.pricefeed]}
                target="_blank"
                rel="noopener noreferrer"
                title={game.pricefeed}
              >
                <span>{game.name}</span>
                <OpenInNewTab/>
              </a>
            </div>
          </div>
        </div>

        <div className={css.timing}>
          <div className={css.time}>
              {isActual &&
                <>
                  <Countdown className={css.countdown} unixTS={!locked ? round.lockDate : round.endDate} />
                  <div className={css.pietimer}>
                    <AnimatedTimer
                      startUnixTS={round?.startDate}
                      endUnixTS={round?.endDate}
                      progressClass={css.tillpayoutprogress}
                      radius="20"
                    >
                      {!locked &&
                        <AnimatedTimer
                          startUnixTS={round.startDate}
                          endUnixTS={round.lockDate}
                          progressClass={css.timeprogress}
                          radius="15"
                        >
                          <RefreshTimerWhiteIcon />
                        </AnimatedTimer>
                      }
                      {locked && <LockTimerIcon />}
                    </AnimatedTimer>
                  </div>
                </>
              }
              {!isActual &&
                <span title={toLocalStringUnixTS(round.startDate)}>
                  {formattedUnixTS(round.startDate)}
                </span>
              }
          </div>
        </div>

      </div>
    </div>
  )
}

RoundMain.propTypes = {
  className: PropTypes.string,
  round: PropTypes.object,
  game: PropTypes.object,
}

export default RoundMain
