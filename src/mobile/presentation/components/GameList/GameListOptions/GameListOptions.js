import React, { useCallback } from 'react'
import cn from 'clsx'
import AnimatedButton from '@oracly/pm-react-components/app/mobile/components/common/AnimatedButton'
import Dropdown from '@oracly/pm-react-components/app/mobile/components/common/Dropdown'
import { formatDistanceUnixTS } from '@oracly/pm-libs/date-utils'

import { UNIX_MINUTE } from '@constants'
import { SILVER, BRONZE, GOLD } from '@constants'

import CloseIcon from '@components/SVG/CloseIcon'

import { useTranslate } from '@lib/i18n-utils'

import { connect } from '@state'
import {
  SET_GAME_LIST_FILTER_LEVEL,
  SET_GAME_LIST_FILTER_SCHEDULE,
} from '@state/actions'
import {
  getGameListFilterLevel,
  getGameListFilterSchedule,
} from '@state/getters'

import css from './GameListOptions.module.scss'

const popperModifiers = [
  {
    name: 'custom',
    enabled: true,
    phase: 'beforeWrite',
    requires: ['computeStyles'],
    fn: ({ state }) => {
      state.styles.popper.minWidth = `${state.rects.reference.width}px`
      state.styles.popper.top = `-${state.rects.reference.height}px`
      state.styles.popper.left = '0px'
    },
    effect: ({ state }) => {
      state.elements.popper.style.minWidth = `${
        state.elements.reference.offsetWidth
      }px`
    }
  },
  { name: 'offset', options: { offset: [0, 0] } },
]

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
    6 * UNIX_MINUTE,
  ]

  const setLevel = useCallback((e) => {
    const level = e.currentTarget?.dataset?.level
    if (!level) return

    const active = e.currentTarget?.dataset?.active
    if (active === level) {
      props.SET_GAME_LIST_FILTER_LEVEL({ level: BRONZE })
    } else {
      props.SET_GAME_LIST_FILTER_LEVEL({ level })
    }
  }, [])

  const setSchedule = useCallback(
    (schedule) => {
      if (props.schedule === schedule) {
        props.SET_GAME_LIST_FILTER_SCHEDULE({ schedule: null })
      } else {
        props.SET_GAME_LIST_FILTER_SCHEDULE({ schedule })
      }
    },
    [props.schedule]
  )

  const valueRenderer = useCallback((schedule) =>
    formatDistanceUnixTS(0, schedule - positioning, { short: true }), [])
  const optionRenderer = useCallback((schedule, selected) => (
    <>
      {formatDistanceUnixTS(0, schedule - positioning, { short: true })}
      {selected && <CloseIcon />}
    </>
  ), [])

  return (
    <div className={css.container}>
      <div className={cn(css.options, css.level)}>
        {levels.map((option, idx) => (
          <AnimatedButton
            key={idx}
            dataLevel={option.level}
            dataActive={props.level}
            shadowColor="transparent"
            hoverColor={
              option.level === props.level ||
              (option.level === BRONZE && props.level === null)
                ? '#FFFFFFAA'
                : '#ffffff40'
            }
            hoverCircleOpacity={0.04}
            hoverBorderOpacity={0.23}
            activeInnerCircle={0.06}
            activeBorderCircle={0.32}
            className={cn(css.option, option.className, {
              [css.selected]:
                option.level === props.level ||
                (option.level === BRONZE && props.level === null),
            })}
            onClick={setLevel}
          >
            {option.title}
          </AnimatedButton>
        ))}
      </div>
      <Dropdown
        headerClassName={css.dropdownHeader}
        bodyClassName={css.dropdownBody}
        optionClassName={css.scheduleOption}
        selectedOptionClassName={css.selected}
        iconColor="#D0D7FF"
        value={props.schedule}
        options={schedules}
        placeholder={t('Duration')}
        popperModifiers={popperModifiers}
        onChange={setSchedule}
        valueRenderer={valueRenderer}
        optionRenderer={optionRenderer}
      />
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
