import React, { useCallback } from 'react'
import GHNetworkStatus from '@oracly/pm-react-components/app/desktop/components/NetworkStatus'

import { SET_NETWORK_MODAL_OPEN } from '@actions'
import { connect } from '@state'
import { getNetworkStatus } from '@state/getters'

import css from './NetworkStatus.module.scss'

const popperOffset = [-45, 5]

const NetworkStatus = (props) => {

  const { networkStatus } = props

  const handleNetworkStatusClick = useCallback(() => {
    props.SET_NETWORK_MODAL_OPEN({ isOpened: true })
  }, [])

  return (
    <GHNetworkStatus
      className={css.container}
      networkStatus={networkStatus}
      popperOffset={popperOffset}
      onClick={handleNetworkStatusClick}
    />
  )
}

export default connect(
  (state) => ({ networkStatus: getNetworkStatus(state) }),
  ({ query, command }) => [command(SET_NETWORK_MODAL_OPEN)]
)(NetworkStatus)
