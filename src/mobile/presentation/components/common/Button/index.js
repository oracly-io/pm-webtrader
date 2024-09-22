import React from 'react'
import cn from 'clsx'

import css from '@styles/components/common/button.module.scss'

const Button = (props) => {
  return (
    <a
      className={cn(css.button, props.className)}
      onClick={props.onClick}
      href={props.href}
    >
      {props.children}
    </a>
  )
}

export default React.memo(Button)
