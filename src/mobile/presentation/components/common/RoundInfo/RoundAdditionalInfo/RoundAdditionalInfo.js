import React from 'react'
import cn from 'clsx'
import config from '@config'
import { toLocalStringUnixTS } from '@oracly/pm-libs/date-utils'
import { htmlAddress, htmlAddressHref } from '@oracly/pm-libs/html-utils'

import { useTranslate } from '@lib/i18n-utils'

import { usePriceContext } from '@components/common/RoundInfo/Price'

import css from './RoundAdditionalInfo.module.scss'
import { InfoRow } from './InfoRow'

const RoundAdditionalInfo = ({ round }) => {
  const { expanded } = usePriceContext()

  const t = useTranslate()

  return (
    <div className={cn(css.roundAdditionalInfo, { [css.open]: expanded })}>
      <div className={css.container}>
        <InfoRow
          description={t('Round ID')}
          valueHref={htmlAddressHref(config.oraclyv1_address)}
          value={htmlAddress(round.roundid)}
          valueType="link"
        />
        <InfoRow
          description={t('Game ID')}
          valueHref={htmlAddressHref(config.meta_address)}
          value={htmlAddress(round.gameid)}
          valueType="link"
        />
        <InfoRow
          description={t('Price Feed')}
          valueHref={htmlAddressHref(round.pricefeed)}
          value={htmlAddress(round.pricefeed)}
          valueType="link"
        />
        <InfoRow
          description={t('Mint')}
          value={toLocalStringUnixTS(round.openedAt, 'pp')}
        />
        <InfoRow
          description={t('Lock-In')}
          value={toLocalStringUnixTS(round.lockDate, 'pp')}
        />
        <InfoRow
          description={t('End')}
          value={toLocalStringUnixTS(round.endDate, 'pp')}
        />
        <InfoRow
          description={t('Exp')}
          value={toLocalStringUnixTS(round.expirationDate, 'pp')}
        />
      </div>
    </div>
  )
}

export default React.memo(RoundAdditionalInfo)
