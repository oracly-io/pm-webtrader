import React, { useCallback } from 'react'
import PropTypes from 'prop-types'

import css from './ModalStopPropagation.module.scss'

const ModalStopPropagation = ({ children }) => {
  const stopPropagation = useCallback((e) => e.stopPropagation(), [])

  return (
    <div className={css.container} onClick={stopPropagation}>{children}</div>
  )
}

ModalStopPropagation.propTypes = {
  children: PropTypes.node,
}

export default ModalStopPropagation