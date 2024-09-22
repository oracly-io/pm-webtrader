import { useState, useEffect } from 'react'
import { isNumber, isArray } from 'lodash'
import { durationUnixTS, toUnixTS, nowUnixTS, nowTS } from '@oracly/pm-libs/date-utils'

export function useCountdownUnixTS (finish, dependency, period) {

  if (!isNumber(period)) period = 1
  if (!isArray(dependency)) dependency = [finish]

  const [countdown, setCountdown] = useState(durationUnixTS(finish))

	useEffect(() => {
    setCountdown(durationUnixTS(finish))

    let TIMERID
    let STARTID = setTimeout(
      () =>
        TIMERID = setInterval(
          () => {
            setCountdown(durationUnixTS(finish))
          },
          period * 1000
        )
      ,
      (nowUnixTS() + period) * 1000 - nowTS()
    )

    return () => {
      clearTimeout(STARTID)
      clearInterval(TIMERID)
    }
  }, dependency)

  return countdown
}

export function useCountdown (finish, dependency) {
  return useCountdownUnixTS(toUnixTS(finish), dependency)
}
