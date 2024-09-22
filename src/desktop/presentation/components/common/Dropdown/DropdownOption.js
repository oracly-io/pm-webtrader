import React from 'react'
import PropTypes from 'prop-types'
import cn from 'clsx'

import css from './DropdownOption.module.scss'

const DropdownOption = ({
  className,
  option,
  renderer = (value) => value.label,
  onClick
}) => {
  return (
    <div
      className={cn(css.option, className)}
      onClick={() => onClick(option)}
    >
      {renderer(option)}
    </div>
  )
}

DropdownOption.propTypes = {
  className: PropTypes.string,
  option: PropTypes.any,
  onClick: PropTypes.func,
  renderer: PropTypes.func,
}

export default DropdownOption