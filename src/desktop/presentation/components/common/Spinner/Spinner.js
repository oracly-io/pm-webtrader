import React from 'react'
import PropTypes from 'prop-types'
import cn from 'clsx'

import css from './Spinner.module.scss'

const Spinner = ({ className }) => <div className={cn(css.spinner, className)} />

Spinner.propTypes = {
  className: PropTypes.string,
}

export default Spinner