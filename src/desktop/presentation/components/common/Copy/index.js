import React, { useState, useCallback } from 'react'
import cn from 'clsx'

import { useTranslate } from '@lib/i18n-utils'

import CopyIcon from '@components/SVG/Copy'

import css from './Copy.module.scss'

const Copy = (props) => {
  const t = useTranslate()

  const [copied, setCopied] = useState(0)
  const copy = useCallback(() => {
    navigator.clipboard.writeText(props.text)
    setCopied(copied + 1)
  }, [props.text, copied])

  if (!window.isSecureContext) return null
  return (
    <div
      className={cn(css.icon, props.className)}
      onClick={copy}
    >
      {!!copied &&
        <div
          className={css.copied}
          key={copied}
        >
          {t('Copied!')}
        </div>
      }
      <CopyIcon />
    </div>
  )

}

export default React.memo(Copy)
