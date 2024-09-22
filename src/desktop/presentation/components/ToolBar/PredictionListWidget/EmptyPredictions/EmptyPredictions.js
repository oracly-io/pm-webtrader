import React from 'react'

import WaitingCat from '@components/SVG/WaitingCat'
import { useTranslate } from '@lib/i18n-utils'

import css from './EmptyPredictions.module.scss'

const EmptyPredictions = () => {
  const t = useTranslate()

  return (
    <div className={css.container}>
      <div>
        <WaitingCat />
        <h4>{t('No predictions yet')}</h4>
        <p>{t('Make your first prediction')}</p>
      </div>
    </div>
  )
}

export default React.memo(EmptyPredictions)