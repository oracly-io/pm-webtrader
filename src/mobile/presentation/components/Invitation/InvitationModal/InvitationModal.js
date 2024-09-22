import { isString } from 'lodash'
import React, { useCallback, useEffect } from 'react'
import PropTypes from 'prop-types'
import { useSearchParams } from 'react-router-dom'
import AnimatedButton from '@oracly/pm-react-components/app/mobile/components/common/AnimatedButton'
import { useWallet } from '@oracly/pm-libs/crypto-wallet'
import { htmlAddress } from '@oracly/pm-libs/html-utils'

import { JOIN_MENTOR, SET_SHOW_CONNECT_BAR } from '@actions'
import { WALLET_CONNECT, RESOVLE_ADDRESS_TO_NICKNAME } from '@actions'
import Avatar from '@components/common/Avatar'
import Nickname from '@components/common/Nickname'
import Address from '@components/common/Address'
import Spinner from '@components/common/Spinner'
import { getAccountNickname, isLoading, isSucceed } from '@state/getters'

import { connect } from '@state'

import css from './InvitationModal.module.scss'

const InvitationModal = (props) => {

  const {
    from,
    nickname,
    close,
    isConnecting,
    isConfirming,
    isConfirmingSucceed,
  } = props

  const [searchParams, setSearchParams] = useSearchParams()

  const username = nickname || htmlAddress(from)
  const wallet = useWallet()
  const isConnected = wallet.ready && wallet.chain && wallet.account
  const isLoading = isConfirming || isConnecting

  useEffect(() => {
    if (from && !isString(nickname)) props.RESOVLE_ADDRESS_TO_NICKNAME({ address: from })
  }, [nickname, from])

  const joinMentor = useCallback(() => {
    if (isConnected) props.JOIN_MENTOR({ mentorid: from })
    else props.SET_SHOW_CONNECT_BAR({ isOpened: true })
  }, [isConnected, from])

  const removeInvitation = useCallback(() => {
    searchParams.delete('invitation')
    setSearchParams(searchParams, { replace: true })
  }, [searchParams])

  const handleDecline = useCallback(() => {
    removeInvitation()
    close()
  }, [close, removeInvitation])

  useEffect(() => {
    if (isConfirmingSucceed) {
      removeInvitation()
      close()
    }
  }, [isConfirmingSucceed, close, removeInvitation])

  return (
    <div className={css.container}>
      <Avatar className={css.avatar} address={from} />
      <div className={css.userinfo}>
        {nickname && <Nickname className={css.nickname} address={from} />}
        <Address className={css.address} address={from} />
      </div>
      <span className={css.message}>
        {username} invites you to play together. By accepting this invitation, you will have {username} as your mentor.
      </span>
      <AnimatedButton
        className={css.joinBtn}
        onClick={joinMentor}
        disabled={isLoading}
      >
        {isLoading ? <Spinner /> : 'Accept Invitation'}
      </AnimatedButton>

      <AnimatedButton
        className={css.declineBtn}
        onClick={handleDecline}
      >
        Decline Invitation
      </AnimatedButton>
    </div>
  )
}

InvitationModal.propTypes = {
  from: PropTypes.string.isRequired,
}

export default connect(
  (state, { from }) => {
    return {
      nickname: getAccountNickname(state, from),
      isConnecting: isLoading(state, WALLET_CONNECT),
      isConfirming: isLoading(state, JOIN_MENTOR, [from]),
      isConfirmingSucceed: isSucceed(state, JOIN_MENTOR, [from]),
    }
  },
  ({ command }) => [
    command(JOIN_MENTOR),
    command(SET_SHOW_CONNECT_BAR),
    command(RESOVLE_ADDRESS_TO_NICKNAME),
  ]
)(InvitationModal)