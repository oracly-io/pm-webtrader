import React from 'react'
import PropTypes from 'prop-types'
import { map, uniqBy, take } from 'lodash'
import cn from 'clsx'
import { htmlCurrencyNamed } from '@oracly/pm-libs/html-utils'

import Avatar from '@components/common/Avatar'

import { useTranslate } from '@lib/i18n-utils'

import css from './RoundTopBettorsTag.module.scss'

const TOP = 7

const RoundTopBettorsTag = ({ className, predictions, round }) => {
  const t = useTranslate()

  return (
    <div className={cn(css.topbettors, className)}>
      <div className={css.avatars}>
        {map(take(uniqBy(predictions, 'bettor'), TOP), ({ predictionid, bettor, wager }) =>
          <div
            key={predictionid}
            className={css.avatar}
            title={t('{{bettor}} wagered {{wager}}', { bettor, wager: htmlCurrencyNamed(wager, round.currency) })}
          >
            <Avatar address={bettor} />
          </div>
        )}
      </div>
    </div>
  )
}

RoundTopBettorsTag.propTypes = {
  className: PropTypes.string,
  round: PropTypes.object.isRequired,
  predictions: PropTypes.array,
}

export default React.memo(RoundTopBettorsTag)
