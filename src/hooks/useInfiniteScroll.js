import { useCallback, useEffect, useRef } from 'react'
import { noop, throttle } from 'lodash'

export const useInfiniteScroll = (callback = noop, dependency) => {
  const elementRef = useRef(null)

  const onScroll = useCallback(throttle(() => {
    const scrollTop = elementRef.current.scrollTop
    const scrollHeight = elementRef.current.scrollHeight
    const clientHeight = elementRef.current.clientHeight

    if (scrollTop + clientHeight + 1 >= scrollHeight) callback()
  }, 300), dependency)

  useEffect(() => {
    const element = elementRef.current
    element.addEventListener('scroll', onScroll, { passive: true })
    return () => element.removeEventListener('scroll', onScroll)
  }, [onScroll])

  return elementRef
}
