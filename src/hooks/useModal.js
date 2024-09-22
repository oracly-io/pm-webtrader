import React, { useCallback, useState } from 'react'
import { isDesktopEnv } from '@oracly/pm-libs/env-utils'

import config from '@config'

import ModalStopPropagation from '@components/modals/ModalStopPropagation'
import { getModalByType } from '@components/modals'

export const useModal = ({
  type = 'primary',
  Content,
  openOnMount = false,
  onClose,
  ...modalProps
}) => {
  const [isOpen, setIsOpen] = useState(openOnMount)
  const [props, setProps] = useState({})

  const open = useCallback((props) => {
    setIsOpen(true)
    setProps(props)
    if (isDesktopEnv(config)) document.body.style.overflow = 'hidden'
  }, [])

  const close = useCallback(() => {
    onClose && onClose()
    setIsOpen(false)
    if (isDesktopEnv(config)) document.body.style.overflow = 'visible'
  }, [onClose])

  const Modal = getModalByType(type)

  return {
    modal: (
      <ModalStopPropagation>
        <Modal
          isOpen={isOpen}
          close={close}
          {...modalProps}
          {...props}
        >
          {Content && <Content
            open={open}
            close={close}
            {...modalProps}
            {...props}
          />}
        </Modal>
      </ModalStopPropagation>
    ),
    open,
    close,
    isOpen,
  }
}
