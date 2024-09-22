import React from 'react'
import PropTypes from 'prop-types'
import cn from 'clsx'

import css from './RoundGroupTitle.module.scss'

const RoundGroupTitle = ({
  className,
  htmlTitle,
  title,
  children,
}) => {
  return (
    <div className={cn(css.title, className)}>
      <span title={htmlTitle}>{title}</span>
      {children}
    </div>
  )
}

RoundGroupTitle.propTypes = {
  className: PropTypes.string,
  htmlTitle: PropTypes.string,
  title: PropTypes.node,
}

export default RoundGroupTitle
