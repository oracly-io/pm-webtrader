import { useCallback } from 'react'
import { isEmpty } from 'lodash'
import { nowUnixTS } from '@oracly/pm-libs/date-utils'

import {
  WITHDRAW,
  RESOLVE_WITHDRAW,
  RESOLVE_WITHDRAW_NOCONTEST,
} from '@actions'
import { useRenderAt } from '@hooks'
import { isNoContestEmptyRound } from '@utils'

export const useWithdraw = (props, { round, prediction, settlment, disabled }) => {
  if (
    !(
      props.WITHDRAW &&
      props.RESOLVE_WITHDRAW_NOCONTEST &&
      props.RESOLVE_WITHDRAW
    )
  ) {
    // eslint-disable-next-line
    console.error(
      `It seems you forgot to connect some of action/actions: ${WITHDRAW}, ${RESOLVE_WITHDRAW}, ${RESOLVE_WITHDRAW_NOCONTEST}`
    )
  }

  const expired = round?.expirationDate <= nowUnixTS()
  useRenderAt(round?.expirationDate)

  const emptyround = isNoContestEmptyRound(round)

  const withdraw = useCallback(
    (e) => {
      e.stopPropagation()
      if (disabled || !prediction?.predictionid) return

      if (round?.resolved) {
        props.WITHDRAW &&
          props.WITHDRAW({
            roundid: round.roundid,
            predictionid: prediction.predictionid,
            erc20: prediction.erc20,
          })
      }

      if (!round?.resolved && !isEmpty(round?.roundid)) {
        if (emptyround || expired) {
          props.RESOLVE_WITHDRAW_NOCONTEST &&
            props.RESOLVE_WITHDRAW_NOCONTEST({
              roundid: round.roundid,
              predictionid: prediction.predictionid,
              erc20: prediction.erc20,
            })
        } else {
          if (!isEmpty(settlment)) {
            props.RESOLVE_WITHDRAW &&
              props.RESOLVE_WITHDRAW({
                roundid: round.roundid,
                predictionid: prediction.predictionid,
                erc20: prediction.erc20,
                resolution: settlment.exitPrice.roundid,
                control: settlment.controlPrice.roundid,
              })
          }
        }
      }
    },
    [
      prediction?.predictionid,
      prediction?.erc20,
      round?.roundid,
      round?.resolved,
      settlment,
      expired,
      emptyround,
      disabled,
    ]
  )

  return withdraw
}
