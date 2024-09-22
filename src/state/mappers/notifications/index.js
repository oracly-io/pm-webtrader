import { ethers } from 'ethers'

export const toErrorCode = (data) => {
  const hexCode = data ? ('0x' + data?.substring(138)) : null

  // eslint-disable-next-line no-control-regex
  const code = hexCode ? ethers.toUtf8String(hexCode).replace(/\x00/g, '') : null

  return code
}

export const getNotificationByCode = (code) => {

  const nitifications = {
    CannotPlacePredictionOutOfPositioningPeriod: {
      type: 'error',
      message: 'The transaction did not have time to complete and was rejected.',
      icon: 'clock',
    },
  }

  return nitifications[code]
}