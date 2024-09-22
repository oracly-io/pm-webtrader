import React from 'react'
import PropTypes from 'prop-types'
import cn from 'clsx'
import { formatUnixTS, toLocalStringUnixTS } from '@oracly/pm-libs/date-utils'
import { htmlTransaction, htmlTransactionHref, htmlAddress, htmlAddressHref } from '@oracly/pm-libs/html-utils'

import { DOWN, UP, EQUAL, NOCONTEST, UNDEFINED } from '@constants'

import { useTranslate } from '@lib/i18n-utils'

import Verified from '@components/SVG/Verified'

import WageredDownIcon from '@components/SVG/WageredDownIcon'
import WageredUpIcon from '@components/SVG/WageredUpIcon'
import WageredZeroIcon from '@components/SVG/WageredZeroIcon'
import WageredNoContestIcon from '@components/SVG/WageredNoContestIcon'

import { PriceHeader, PriceRow, PriceDetails, usePriceContext } from '../Price'

import css from './VerifiedOutcome.module.scss'

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

const VerifiedOutcome = (props) => {
  const t = useTranslate()

  const round = props.round
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
    <div>
      <PriceHeader
        className={cn(css.pheader, headerClassName, { [css.expanded]: expanded })}
        description={t('Outcome')}
        descriptionTitle={t('Blockchain Verified')}
        descriptionIcon={<Verified/>}
        valueIcon={<RoundResolutionIcon resolution={round.resolution} />}
        value={outcomes[round.resolution]}
        valueTitle={outcomes[round.resolution]}
      />

      <PriceDetails className={detailsClassName}>

        {round.resolutionTransactionHash && (
          <PriceRow
            description={t('Transaction Hash')}
            value={htmlTransaction(round.resolutionTransactionHash)}
            valueTitle={round.resolutionTransactionHash}
            valueType="link"
            valueHref={htmlTransactionHref(round.resolutionTransactionHash)}
          />
        )}

        {round.resolvedBy && (
          <PriceRow
            description={t('Verified By')}
            value={htmlAddress(round.resolvedBy)}
            valueTitle={round.resolvedBy}
            valueType="link"
            valueHref={htmlAddressHref(round.resolvedBy)}
          />
        )}

        {round.resolvedAt && (
          <PriceRow
            description={t('Verified At')}
            value={formatUnixTS(round.resolvedAt, 'pp')}
            valueTitle={toLocalStringUnixTS(round.resolvedAt)}
          />
        )}

      </PriceDetails>
    </div>
  )
}

VerifiedOutcome.propTypes = {
  headerClassName: PropTypes.string,
  detailsClassName: PropTypes.string,
  round: PropTypes.object.isRequired,
}

export default React.memo(VerifiedOutcome)
