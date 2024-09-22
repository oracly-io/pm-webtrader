import React, { useCallback, useState } from 'react'

import { getModalByType } from './modals.utils'
import ModalStopPropagation from './ModalStopPropagation'

const useModal = ({
  type = 'primary',
  Content,
  openOnMount = false,
  ...modalProps
}) => {
  const [isOpen, setIsOpen] = useState(openOnMount)
  const [props, setProps] = useState({})

  const open = useCallback((props) => {
    setIsOpen(true)
    setProps(props)
    document.body.style.overflow = 'hidden'
  }, [])

  const close = useCallback(() => {
    setIsOpen(false)
    document.body.style.overflow = 'visible'
  }, [])

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

export default useModal