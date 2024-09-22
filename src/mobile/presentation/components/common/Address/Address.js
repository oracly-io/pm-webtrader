import React from 'react'
import PropTypes from 'prop-types'
import cn from 'clsx'
import { htmlAddress } from '@oracly/pm-libs/html-utils'

import css from './Address.module.scss'

const Address = ({ className, address = '' }) => {
  return (
    <span className={cn(css.container, className)}>{htmlAddress(address)}</span>
  )
}

Address.propTypes = {
  className: PropTypes.string,
  address: PropTypes.string,
}

export default Address