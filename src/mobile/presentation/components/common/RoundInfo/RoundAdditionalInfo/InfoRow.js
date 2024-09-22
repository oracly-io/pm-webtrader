import React from 'react'
import cn from 'clsx'

import OpenInNewTab from '@components/SVG/OpenInNewTab'

import css from './InfoRow.module.scss'

export const InfoRow = ({ description, valueTitle, value, valueType, valueHref }) => {

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