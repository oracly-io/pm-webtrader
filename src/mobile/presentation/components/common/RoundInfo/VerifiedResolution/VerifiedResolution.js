import React from 'react'
import PropTypes from 'prop-types'
import cn from 'clsx'
import { formatUnixTS, toLocalStringUnixTS } from '@oracly/pm-libs/date-utils'
import { htmlCurrencyNamed, htmlCurrentySymboled } from '@oracly/pm-libs/html-utils'
import { htmlPricefeedRoundid } from '@oracly/pm-libs/html-utils'

import { DOWN, UP, EQUAL } from '@constants'

import { useTranslate } from '@lib/i18n-utils'

import Verified from '@components/SVG/Verified'

import WageredDownIcon from '@components/SVG/WageredDownIcon'
import WageredUpIcon from '@components/SVG/WageredUpIcon'
import WageredZeroIcon from '@components/SVG/WageredZeroIcon'

import { PriceHeader, PriceRow, PriceDetails, usePriceContext } from '../Price'

import css from './VerifiedResolution.module.scss'

const WageredIcon = ({ resolution }) => {
  if(resolution === UP) return <WageredUpIcon />
  if(resolution === DOWN) return <WageredDownIcon />
  if(resolution === EQUAL) return <WageredZeroIcon />
  return null
}

const VerifiedResolution = (props) => {
  const t = useTranslate()

  const game = props.game
  const round = props.round
  const headerClassName = props.headerClassName
  const detailsClassName = props.detailsClassName

  const { expanded } = usePriceContext()

  return (
    <div>
      <PriceHeader
        className={cn(css.pheader, headerClassName, { [css.expanded]: expanded })}
        description={t('Exit Price')}
        descriptionTitle={t('Blockchain Verified')}
        descriptionIcon={<Verified/>}
        valueIcon={<WageredIcon resolution={round.resolution} />}
        value={htmlCurrentySymboled(round.exitPriceValue, game.quote)}
        valueTitle={htmlCurrencyNamed(round.exitPriceValue, game.quote)}
      />

      <PriceDetails className={detailsClassName}>

        {round.exitPriceRoundid && (
          <PriceRow
            description={t('Exit Price ID')}
            value={htmlPricefeedRoundid(round.exitPriceRoundid)}
            valueTitle={round.exitPriceRoundid}
            valueType="copy"
            valueCopyText="round.exitPriceRoundid"
          />
        )}

        {round.exitPriceTimestamp && (
          <PriceRow
            description={t('Exit Price Time')}
            value={formatUnixTS(round.exitPriceTimestamp, 'pp')}
            valueTitle={toLocalStringUnixTS(round.exitPriceTimestamp)}
          />
        )}

      </PriceDetails>
    </div>
  )
}

VerifiedResolution.propTypes = {
  headerClassName: PropTypes.string,
  detailsClassName: PropTypes.string,
  round: PropTypes.object.isRequired,
  game: PropTypes.object.isRequired,
}

export default React.memo(VerifiedResolution)


