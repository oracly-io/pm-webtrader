import { useEffect } from 'react'
import { useStore } from 'react-redux'

export const useEffectState = (cb, dependency) => {
  const store = useStore()

  useEffect(() => cb(store.getState()), dependency)
}
