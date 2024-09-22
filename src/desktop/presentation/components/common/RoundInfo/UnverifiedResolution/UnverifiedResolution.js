import React from 'react'
import PropTypes from 'prop-types'
import cn from 'clsx'
import { formatUnixTS, toLocalStringUnixTS } from '@oracly/pm-libs/date-utils'
import { htmlCurrencyNamed, htmlCurrentySymboled } from '@oracly/pm-libs/html-utils'
import { htmlPricefeedRoundid } from '@oracly/pm-libs/html-utils'

import { DOWN, UP, EQUAL } from '@constants'
import { useTranslate } from '@lib/i18n-utils'

import WageredDownIcon from '@components/SVG/WageredDownIcon'
import WageredUpIcon from '@components/SVG/WageredUpIcon'
import WageredZeroIcon from '@components/SVG/WageredZeroIcon'

import Unverified from '@components/SVG/Unverified'

import { PriceHeader, PriceRow, PriceDetails, usePriceContext } from '../Price'

import css from './UnverifiedResolution.module.scss'

const WageredIcon = ({ resolution }) => {
  if(resolution === UP) return <WageredUpIcon />
  if(resolution === DOWN) return <WageredDownIcon />
  if(resolution === EQUAL) return <WageredZeroIcon />
  return null
}

const UnverifiedResolutionPrice = (props) => {
  const t = useTranslate()

  const settlment = props.settlment
  const game = props.game
  const resolution = props.unverifiedResolution
  const headerClassName = props.headerClassName
  const detailsClassName = props.detailsClassName

  const { expanded } = usePriceContext()

  return (
    <div className={css.container}>

      <PriceHeader
        className={cn(css.pheader, headerClassName, { [css.expanded]: expanded })}
        description={t('Exit Price')}
        descriptionTitle={t('Unverified')}
        descriptionIcon={<Unverified />}
        valueIcon={<WageredIcon resolution={resolution} />}
        value={htmlCurrentySymboled(settlment.exitPrice.value, game.quote)}
        valueTitle={htmlCurrencyNamed(settlment.exitPrice.value, game.quote)}
      />

      <PriceDetails className={detailsClassName}>

        {settlment.exitPrice.roundid && (
          <PriceRow
            description={t('Exit Price ID')}
            value={htmlPricefeedRoundid(settlment.exitPrice.roundid)}
            valueTitle={settlment.exitPrice.roundid}
            valueType="copy"
            valueCopyText={settlment.exitPrice.roundid}
          />
        )}

        {settlment.exitPrice.timestamp && (
          <PriceRow
            description={t('Exit Price Time')}
            value={formatUnixTS(settlment.exitPrice.timestamp, 'pp')}
            valueTitle={toLocalStringUnixTS(settlment.exitPrice.timestamp)}
          />
        )}

      </PriceDetails>

    </div>
  )
}

UnverifiedResolutionPrice.propTypes = {
  headerClassName: PropTypes.string,
  detailsClassName: PropTypes.string,
  game: PropTypes.object.isRequired,
  settlment: PropTypes.object.isRequired,
}

export default React.memo(UnverifiedResolutionPrice)
