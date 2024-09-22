import React from 'react'
import { isEmpty } from 'lodash'
import cn from 'clsx'
import { htmlPercent } from '@oracly/pm-libs/html-utils'

import { PRIZEFUNDS } from '@constants'

import { connect } from '@state'
import { getActualRound, getActiveGameId } from '@state/getters'

import PercentDown from '@components/SVG/PercentDown'
import PercentUp from '@components/SVG/PercentUp'

import css from './RoundPrizefundsBar.module.scss'

const RoundPrizefundsBar = (props) => {
  if (isEmpty(props.round)) return null

  const prizefund = Number(props.round.prizefunds[PRIZEFUNDS.TOTAL])
  const prizefundUp = Number(props.round.prizefunds[PRIZEFUNDS.UP])
  const prizefundDown = Number(props.round.prizefunds[PRIZEFUNDS.DOWN])
  const prizefundZero = Number(props.round.prizefunds[PRIZEFUNDS.EQUAL])

  const prizefundUpPercent = prizefundUp / prizefund
  const prizefundDownPercent = prizefundDown / prizefund
  const prizefundZeroPercent = prizefundZero / prizefund

  return (
    <div
      className={cn(css.roundprizefundsbar, { [css.idel]: prizefund === 0 })}
    >
      {!!prizefundZeroPercent && (
        <div
          className={cn(css.percent, css.perzero)}
          style={{
            top: htmlPercent(prizefundUpPercent + prizefundZeroPercent / 2),
          }}
        >
          +{htmlPercent(prizefundZeroPercent)}
        </div>
      )}

      {!!prizefundUpPercent && (
        <div className={cn(css.percent, css.perup)}>
          <PercentUp />
          +{htmlPercent(prizefundUpPercent)}
        </div>
      )}

      <div className={css.lines}>
        <div
          className={css.lineup}
          style={{ height: htmlPercent(prizefundUpPercent) }}
        ></div>
        <div
          className={css.linezero}
          style={{ height: htmlPercent(prizefundZeroPercent) }}
        ></div>
        <div
          className={css.linedown}
          style={{ height: htmlPercent(prizefundDownPercent) }}
        ></div>
      </div>

      {!!prizefundDownPercent && (
        <div className={cn(css.percent, css.perdown)}>
          <PercentDown />
          +{htmlPercent(prizefundDownPercent)}
        </div>
      )}
    </div>
  )
}

export default connect((state) => ({
  round: getActualRound(state, getActiveGameId(state)),
}))(React.memo(RoundPrizefundsBar))
