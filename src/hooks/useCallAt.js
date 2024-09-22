import { isArray, isFunction, isNumber, noop } from 'lodash'
import { useEffect, useRef } from 'react'
import { nowUnixTS, nowTS } from '@oracly/pm-libs/date-utils'

export function useCallAt(callback, unixTS, dependency) {
  if (!isFunction(callback)) callback = noop
  if (!isNumber(unixTS)) unixTS = nowUnixTS()
  if (!isArray(dependency)) dependency = [unixTS]

  const callbackRef = useRef(callback)

  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  useEffect(() => {
    const delay = unixTS * 1000 - nowTS()
    if (delay >= 0) {
      const STARTID = setTimeout(() => {
        callbackRef.current()
      }, delay)
      return () => {
        clearTimeout(STARTID)
      }
    }
  }, dependency)
}
