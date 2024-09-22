import React from 'react'
import PropTypes from 'prop-types'
import cn from 'clsx'

import { DOWN, UP, EQUAL, NOCONTEST, UNDEFINED } from '@constants'
import { useTranslate } from '@lib/i18n-utils'

import WageredDownIcon from '@components/SVG/WageredDownIcon'
import WageredUpIcon from '@components/SVG/WageredUpIcon'
import WageredZeroIcon from '@components/SVG/WageredZeroIcon'
import WageredNoContestIcon from '@components/SVG/WageredNoContestIcon'

import Unverified from '@components/SVG/Unverified'

import { PriceHeader, PriceRow, PriceDetails, usePriceContext } from '../Price'

import css from './UnverifiedOutcome.module.scss'

const RoundResolutionIcon = ({ resolution }) => {
  if (!(
    resolution === UP ||
    resolution === DOWN ||
    resolution === EQUAL ||
    resolution === NOCONTEST
  )) return null

  return (
    <div className={css.resolutionicon}>
      {resolution === UP && <WageredUpIcon />}
      {resolution === DOWN && <WageredDownIcon />}
      {resolution === EQUAL && <WageredZeroIcon />}
      {resolution === NOCONTEST && <WageredNoContestIcon />}
    </div>
  )
}

const UnverifiedOutcome = (props) => {
  const t = useTranslate()

  const resolution = props.unverifiedResolution
  const headerClassName = props.headerClassName
  const detailsClassName = props.detailsClassName

  const { expanded } = usePriceContext()

  const outcomes = {
    [UP]: t('Up'),
    [DOWN]: t('Down'),
    [EQUAL]: t('Zero'),
    [NOCONTEST]: t('No Contest'),
    [UNDEFINED]: '',
  }

  return (
    <div className={css.container}>

      <PriceHeader
        className={cn(css.pheader, headerClassName, { [css.expanded]: expanded })}
        description={t('Outcome')}
        descriptionTitle={t('Unverified')}
        descriptionIcon={<Unverified />}
        valueIcon={<RoundResolutionIcon resolution={resolution} />}
        value={outcomes[resolution]}
        valueTitle={outcomes[resolution]}
      />

      <PriceDetails className={detailsClassName}>

        <PriceRow
          description={t('Blockchain Status')}
          valueTitle={t('Unverified')}
          value={t('Unverified')}
        />

      </PriceDetails>

    </div>
  )
}

UnverifiedOutcome.propTypes = {
  headerClassName: PropTypes.string,
  detailsClassName: PropTypes.string,
}

export default React.memo(UnverifiedOutcome)
