import React from 'react'
import cn from 'clsx'

import Copy from '@components/common/Copy'
import OpenInNewTab from '@components/SVG/OpenInNewTab'

import css from './PriceRow.module.scss'

export const PriceRow = ({ description, valueTitle, value, valueType, valueHref, valueCopyText }) => {

  const renderValue = () => {
    switch (valueType) {
      case 'link':
        return (
          <div className={css.valueContainer} title={valueTitle}>
            <a
              className={cn(css.icon, css.link)}
              href={valueHref}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className={css.link}>
                <OpenInNewTab />
                <span className={css.value} title={valueTitle}>{value}</span>
              </span>
            </a>
          </div>
        )

      case 'copy':
        return (
          <div className={css.valueContainer} title={valueTitle}>
            <Copy className={css.icon} text={valueCopyText} />
            <span className={css.value} title={valueTitle}>{value}</span>
          </div>
        )

      default:
        return (
          <div className={css.valueContainer}>
            <span className={css.value} title={valueTitle}>{value}</span>
          </div>
        )
    }
  }

  return (
    <div className={css.row}>
      <span className={css.description}>{description}</span>
      {renderValue()}
    </div>
  )
}