import React, { useCallback } from 'react'
import { isEmpty } from 'lodash'
import NetworkModal from '@oracly/pm-react-components/app/desktop/components/NetworkModal'
import { formatDistanceUnixTS } from '@oracly/pm-libs/date-utils'
import { htmlCurrentySymboled } from '@oracly/pm-libs/html-utils'

import { SET_NETWORK_MODAL_OPEN } from '@actions'
import { NETWORK_STATUS } from '@constants'
import { useScheduledCommand, useTranslation, useModal } from '@hooks'
import { connect } from '@state'
import { getActiveGameChartDateLatestPrice } from '@state/getters'
import { getLatestbcBlock, getNetworkStatus } from '@state/getters'
import { getNetworkModalIsOpened } from '@state/getters'

import css from './DataSyncModal.module.scss'

const modalClasses = { base: css.overlayBase }

const DataSyncModal = (props) => {

  const { bcblock, latestprice, networkStatus, isOpenedByUser } = props

  const { t } = useTranslation()

  const onModalClose = useCallback(() => {
    props.SET_NETWORK_MODAL_OPEN({ isOpened: false })
  }, [])

  const { modal, isOpen, open, close } = useModal({
    type: 'primary',
    Content: NetworkModal,
    hideClose: true,
    modalClasses,
    onClose: onModalClose,
  })

  useScheduledCommand(() => {
    if (isEmpty(bcblock)) return
    if (isEmpty(latestprice)) return

    if (
      networkStatus === NETWORK_STATUS.WARNING ||
      networkStatus === NETWORK_STATUS.ERROR ||
      isOpenedByUser
    ) {

      const rows = [
        { name: t('Block number'), value: bcblock.number },
        { name: t('Block age'), value: formatDistanceUnixTS(bcblock.timestamp) },
        { name: t('Latest price'), value: htmlCurrentySymboled(latestprice.value, 'USD') },
        { name: t('Price age'), value: formatDistanceUnixTS(latestprice.timestamp) },
      ]

      open({ networkStatus, rows })

    } else {
      isOpen && close()
    }

  }, [isOpen, isOpenedByUser, open, close, bcblock, latestprice, networkStatus])

  return modal

}

export default connect(
  state => ({
    bcblock: getLatestbcBlock(state),
    latestprice: getActiveGameChartDateLatestPrice(state),
    networkStatus: getNetworkStatus(state),
    isOpenedByUser: getNetworkModalIsOpened(state),
  }),
  ({ command }) => [
    command(SET_NETWORK_MODAL_OPEN),
  ]
)(React.memo(DataSyncModal))