import React from 'react'

import InfoOutlined from '@components/SVG/InfoOutlined'
import { usePriceContext } from '@components/common/RoundInfo/Price'

import css from './InfoIcon.module.scss'

export const InfoIcon = () => {
  const { expand } = usePriceContext()

  return (
    <div className={css.info} onClick={expand}>
      <InfoOutlined />
    </div>
  )
}

