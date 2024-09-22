import React from 'react'
import PropTypes from 'prop-types'
import { formatUnixTS, toLocalStringUnixTS } from '@oracly/pm-libs/date-utils'
import { htmlCurrencyNamed, htmlCurrentySymboled } from '@oracly/pm-libs/html-utils'
import { htmlTransaction, htmlAddress } from '@oracly/pm-libs/html-utils'
import { htmlPricefeedRoundid } from '@oracly/pm-libs/html-utils'
import { htmlTransactionHref, htmlAddressHref } from '@oracly/pm-libs/html-utils'

import { useTranslate } from '@lib/i18n-utils'

import Verified from '@components/SVG/Verified'

import { PriceHeader, PriceRow, PriceDetails } from './Price'

const OpenPrice = (props) => {
  const t = useTranslate()

  const game = props.game
  const round = props.round
  const detailsClassName = props.detailsClassName

  if (!round.entryPriceValue) return null

  return (
    <div>
      <PriceHeader
        description={t('Entry Price')}
        descriptionTitle={t('Blockchain Verified')}
        descriptionIcon={<Verified/>}
        value={htmlCurrentySymboled(round.entryPriceValue, game.quote)}
        valueTitle={htmlCurrencyNamed(round.entryPriceValue, game.quote)}
      />

      <PriceDetails className={detailsClassName}>

        {round.openTransactionHash && (
          <PriceRow
            description={t('Transaction Hash')}
            value={htmlTransaction(round.openTransactionHash)}
            valueTitle={round.openTransactionHash}
            valueType="link"
            valueHref={htmlTransactionHref(round.openTransactionHash)}
          />
        )}

        {round.openedBy && (
          <PriceRow
            description={t('Create By')}
            value={htmlAddress(round.openedBy)}
            valueTitle={round.openedBy}
            valueType="link"
            valueHref={htmlAddressHref(round.openedBy)}
          />
        )}

        {round.entryPriceRoundid && (
          <PriceRow
            description={t('Entry Price ID')}
            value={htmlPricefeedRoundid(round.entryPriceRoundid)}
            valueTitle={round.entryPriceRoundid}
            valueType="copy"
            valueCopyText={round.entryPriceRoundid}
          />
        )}

        {round.entryPriceTimestamp && (
          <PriceRow
            description={t('Entry Price Time')}
            value={formatUnixTS(round.entryPriceTimestamp, 'pp')}
            valueTitle={toLocalStringUnixTS(round.entryPriceTimestamp)}
          />
        )}

      </PriceDetails>
    </div>

  )
}

OpenPrice.propTypes = {
  detailsClassName: PropTypes.string,
  round: PropTypes.object.isRequired,
  game: PropTypes.object.isRequired,
}

export default React.memo(OpenPrice)

