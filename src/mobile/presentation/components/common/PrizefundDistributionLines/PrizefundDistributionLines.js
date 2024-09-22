import React from 'react'
import PropTypes from 'prop-types'
import cn from 'clsx'
import { htmlCurrency, htmlPercent, htmlCurrencyNamed } from '@oracly/pm-libs/html-utils'

import { PRIZEFUNDS } from '@constants'
import LevelCurrency from '@components/common/Currency/Level'

import { useTranslate } from '@lib/i18n-utils'

import css from './PrizefundDistributionLines.module.scss'

const PrizefundDistributionLines = (props) => {

  const t = useTranslate()

  if (!Number(props.prizefunds[PRIZEFUNDS.TOTAL])) return null

  const prizefund = Number(props.prizefunds[PRIZEFUNDS.TOTAL])
  const prizefundUp = Number(props.prizefunds[PRIZEFUNDS.UP])
  const prizefundDown = Number(props.prizefunds[PRIZEFUNDS.DOWN])
  const prizefundZero = Number(props.prizefunds[PRIZEFUNDS.EQUAL])

  const prizefundUpPercent = prizefundUp/prizefund
  const prizefundDownPercent = prizefundDown/prizefund
  const prizefundZeroPercent = prizefundZero/prizefund

  return (
    <div className={cn(css.container, props.className)}>
      <div className={css.head}>
        <span className={css.title}>{t('Prize Fund')}</span>
        <div
          className={cn(css.prizefund, { [css.hidden]: !prizefund })}
          title={htmlCurrencyNamed(prizefund, props.currency)}
        >
          <span className={css.total}>{htmlCurrency(prizefund)}</span>
          <LevelCurrency currency={props.currency} type={props.level} />
        </div>
      </div>
      <div className={css.lines}>
        {!!prizefundUpPercent &&
          <div
            className={css.up}
            title={htmlCurrencyNamed(prizefundUp, props.currency)}
            style={{ width: htmlPercent(prizefundUpPercent) }}
          />
        }
        {!!prizefundZeroPercent &&
          <div
            className={css.zero}
            title={htmlCurrencyNamed(prizefundZero, props.currency)}
            style={{ width: htmlPercent(prizefundZeroPercent) }}
          />
        }
        {!!prizefundDownPercent &&
          <div
            className={css.down}
            title={htmlCurrencyNamed(prizefundDown, props.currency)}
            style={{ width: htmlPercent(prizefundDownPercent) }}
          />
        }
      </div>
      <div className={css.funds}>
        {!!prizefundUpPercent &&
          <div
            className={css.fundsup}
            title={htmlCurrencyNamed(prizefundUp, props.currency)}
            style={{ width: htmlPercent(prizefundUpPercent) }}
          >
            {htmlPercent(prizefundUpPercent)}
          </div>
        }
        {!!prizefundZeroPercent &&
          <div
            className={css.fundszero}
            title={htmlCurrencyNamed(prizefundZero, props.currency)}
            style={{ width: htmlPercent(prizefundZeroPercent) }}
          >
            {htmlPercent(prizefundZeroPercent)}
          </div>
        }
        {!!prizefundDownPercent &&
          <div
            className={css.fundsdown}
            title={htmlCurrencyNamed(prizefundDown, props.currency)}
            style={{ width: htmlPercent(prizefundDownPercent) }}
          >
            {htmlPercent(prizefundDownPercent)}
          </div>
        }
      </div>
    </div>
  )
}

PrizefundDistributionLines.propTypes = {
  prizefunds: PropTypes.object,
  currency: PropTypes.string,
}

export default PrizefundDistributionLines
