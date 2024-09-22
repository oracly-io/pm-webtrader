import React from 'react'
import { useTranslate } from '@lib/i18n-utils'

import '@styles/pages/notfound.scss'

const NotFound = (props) => {

    const t = useTranslate()

    return (
      <div className="page-not-found">
          <div>{t('Oops, page is not found!')}</div>
      </div>
    )

}

export default React.memo(NotFound)
