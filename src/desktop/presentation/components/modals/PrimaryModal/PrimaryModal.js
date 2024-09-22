import React, { useCallback, useMemo } from 'react'
import Modal from 'react-modal'
import cn from 'clsx'
import { mergeWith } from 'lodash'

import config from '@config'
import CloseIcon from '@components/SVG/CloseIcon'
import Button from '@components/common/Button'

import css from './PrimaryModal.module.scss'

const classes = {
  modalClasses: {
    base: css.base,
    afterOpen: css.afterOpen,
    beforeClose: css.beforeClose,
  },
  modalOverlayClasses: {
    base: css.overlayBase,
    afterOpen: css.afterOpenOverlay,
    beforeClose: css.beforeCloseOverlay,
  },
}

const mergeClasses = (c1, c2) => mergeWith({}, c1, c2, (objValue, srcValue) => cn(objValue, srcValue))

const PrimaryModal = ({
  children,
  close,
  hideClose,
  modalClasses,
  modalOverlayClasses,
  ...modalProps
}) => {

  const parentSelector = useCallback(() => document.getElementById(config.modal_id), [])

  const className = useMemo(
    () => mergeClasses(classes.modalClasses, modalClasses),
    [modalClasses]
  )

  const overlayClassName = useMemo(
    () => mergeClasses(classes.modalOverlayClasses, modalOverlayClasses),
    [modalOverlayClasses]
  )

  return (
    <Modal
      closeTimeoutMS={300}
      className={className}
      overlayClassName={overlayClassName}
      onRequestClose={close}
      parentSelector={parentSelector}
      {...modalProps}
    >
      {!hideClose && (
        <Button
          onClick={close}
          className={css.close}
        >
          <CloseIcon />
        </Button>
      )}
      {children}
    </Modal>
  )
}

export default PrimaryModal
