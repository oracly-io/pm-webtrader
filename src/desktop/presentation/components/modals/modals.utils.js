import PrimaryModal from '@components/modals/PrimaryModal'

const modalsByType = {
  primary: PrimaryModal,
}

export const getModalByType = (type) => modalsByType[type]
