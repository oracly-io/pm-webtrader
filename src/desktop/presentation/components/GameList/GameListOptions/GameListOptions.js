import React, { useCallback } from 'react'
import cn from 'clsx'
import AnimatedButton from '@oracly/pm-react-components/app/desktop/components/common/AnimatedButton'
import { formatDistanceUnixTS } from '@oracly/pm-libs/date-utils'

import { UNIX_MINUTE } from '@constants'
import { SILVER, BRONZE, GOLD } from '@constants'

import Cup from '@components/SVG/Cup'
import BetTimer from '@components/SVG/BetTimer'
import Unpin from '@components/SVG/Unpin'

import { useTranslate } from '@lib/i18n-utils'

import { connect } from '@state'
import { SET_GAME_LIST_FILTER_LEVEL, SET_GAME_LIST_FILTER_SCHEDULE } from '@state/actions'
import { getGameListFilterLevel, getGameListFilterSchedule } from '@state/getters'

import css from './GameListOptions.module.scss'

const GameListOptions = (props) => {

  const positioning = 60

  const t = useTranslate()

  const levels = [
    { title: t('Bronze'), level: BRONZE, className: css.bronze },
    { title: t('Silver'), level: SILVER, className: css.silver },
    { title: t('Gold'), level: GOLD, className: css.gold },
  ]

  const schedules = [
    2 * UNIX_MINUTE,
    3 * UNIX_MINUTE,
    4 * UNIX_MINUTE,
    6 * UNIX_MINUTE
  ]

  const setLevel = useCallback(e => {

    const level = e.currentTarget?.dataset?.level
    if (!level) return

    const active = e.currentTarget?.dataset?.active
    if (active === level) {
      props.SET_GAME_LIST_FILTER_LEVEL({ level: BRONZE })
    } else {
      props.SET_GAME_LIST_FILTER_LEVEL({ level })
    }

  }, [])

  const setSchedule = useCallback(e => {
    const active = e.currentTarget?.dataset?.active
    if (active === 'true') {

      // deactivate
      props.SET_GAME_LIST_FILTER_SCHEDULE({ schedule: null })

    } else {

      const schedule = +e.currentTarget?.dataset?.schedule
      if (!schedule) return

      props.SET_GAME_LIST_FILTER_SCHEDULE({ schedule })

    }

  }, [])

  return (
    <div className={css.container}>

      <div className={css.title}>{t('Options')}</div>

      <div className={css.group}>
        <div className={css.label}>
          <span className={css.icon}><Cup /></span>
          <span className={css.name}>{t('Game level')}</span>
        </div>
        <ul className={cn(css.options, css.level)}>
          {levels.map((option, idx) => (
            <AnimatedButton
              key={idx}
              dataLevel={option.level}
              dataActive={props.level}
              shadowColor="transparent"
              hoverColor={option.level === props.level || option.level === BRONZE && props.level === null ? '#FFFFFFAA' : '#ffffff40' }
              hoverCircleOpacity={0.04}
              hoverBorderOpacity={0.23}
              activeInnerCircle={0.06}
              activeBorderCircle={0.32}
              className={cn(css.option, option.className, {
                [css.selected]: (
                  option.level === props.level || option.level === BRONZE && props.level === null
                )
              })}
              onClick={setLevel}
            >
              {option.title}
            </AnimatedButton>
          ))}
        </ul>
      </div>

      <div className={css.divider} />

      <div className={css.group}>
        <div className={css.label}>
          <span className={cn(css.icon, css.duration)}><BetTimer /></span>
          <span className={css.name}>{t('Game duration')}</span>
        </div>
        <div className={cn(css.options, css.duration)}>
          {schedules.map((schedule, idx) =>
            <AnimatedButton
              key={idx}
              onClick={setSchedule}
              shadowColor="transparent"
              hoverColor={schedule === props.schedule ? '#FFFFFFAA' : '#ffffff40' }
              hoverCircleOpacity={0.04}
              hoverBorderOpacity={0.23}
              activeInnerCircle={0.06}
              activeBorderCircle={0.32}
              dataSchedule={schedule}
              dataActive={schedule === props.schedule}
              className={cn(css.option,
                { [css.selected]: schedule === props.schedule }
              )}
            >
              {formatDistanceUnixTS(0, schedule - positioning)}
              {schedule === props.schedule && (
                <div className={css.unpin}>
                  <Unpin/>
                  <div className={css.background} />
                </div>
              )}
            </AnimatedButton>
          )}
        </div>
      </div>

    </div>
  )
}

export default connect(
  (state) => {
    return {
      level: getGameListFilterLevel(state),
      schedule: getGameListFilterSchedule(state),
    }
  },
  ({ command }) => [
    command(SET_GAME_LIST_FILTER_LEVEL),
    command(SET_GAME_LIST_FILTER_SCHEDULE),
  ]
)(React.memo(GameListOptions))
