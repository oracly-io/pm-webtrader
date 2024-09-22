import React from 'react'
import { isEmpty } from 'lodash'

import { useTranslate } from '@lib/i18n-utils'

import { connect } from '@state'
import { getActiveGame } from '@state/getters'
import { PRICEFEED } from '@constants'

import ChainlinkLogo from '@components/SVG/Chainlink'

import css from '@styles/components/pricefeedinfo/index.module.scss'

const PriceFeedInfo = (props) => {

  const t = useTranslate()

  if (isEmpty(props.game)) return null
  return (
    <div className={css.pricefeedinfo}>

      <div className={css.event}>

        <div className={css.name}>
          {props.game.name}
        </div>

      </div>

      <div className={css.subtitle}>
        {t('Pricefeed by')}
        <a
          href={PRICEFEED.CL_URL[props.game.pricefeed]}
          target="_blank"
          rel="noopener noreferrer"
        >
          <ChainlinkLogo />
        </a>
      </div>

    </div>
  )

}

export default connect(
  (state) => ({
    game: getActiveGame(state)
  })
)(React.memo(PriceFeedInfo))
