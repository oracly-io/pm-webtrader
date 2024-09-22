import React, { useCallback } from 'react'

import { connect } from '@state'
import { TIMEFRAME_RESET } from '@actions'

import { getIsChartUnstickNow } from '@state/getters'

import ForwardToEnd from '@components/SVG/ForwardToEnd'

import css from './PriceFeedScrollToNow.module.scss'

const PriceFeedScrollToNow = (props) => {

  const reset = useCallback(() => props.TIMEFRAME_RESET({ needreset: true }), [])

  return (props.chartunow &&
    <div
      className={css.scrolltonow}
      onClick={reset}
    >
      <div className={css.container}>
        <div className={css.forward}>
          <ForwardToEnd />
        </div>
      </div>
    </div>
  )

}

export default connect(
  state => ({
    chartunow: getIsChartUnstickNow(state),
  }),
  ({ command }) => [
    command(TIMEFRAME_RESET),
  ],
)(React.memo(PriceFeedScrollToNow))

