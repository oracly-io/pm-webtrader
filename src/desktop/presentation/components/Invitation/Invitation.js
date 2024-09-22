import { useEffect } from 'react'
import { toLower } from 'lodash'
import { isAddress } from 'ethers'
import { useSearchParams } from 'react-router-dom'
import { useWallet } from '@oracly/pm-libs/crypto-wallet'

import { useModal } from '@hooks'

import InvitationModal from './InvitationModal'

import css from './Invitation.module.scss'

const modalOverlayClasses = { base: css.overlayBase }

const Invitation = () => {
  const wallet = useWallet()
  const account = toLower(wallet.account)
  const [searchParams] = useSearchParams()
  const isConnected = wallet.ready && wallet.chain && wallet.account

  const from = toLower(searchParams.get('invitation'))
  const isAddressValid = isAddress(from) && account !== from

  const { modal, open } = useModal({
    type: 'primary',
    Content: InvitationModal,
    hideClose: true,
    shouldCloseOnOverlayClick: false,
    modalOverlayClasses,
    from,
  })

  useEffect(() => {
    if (isAddressValid && isConnected) open()
  }, [open, isConnected, isAddressValid])

  return modal
}

export default Invitation