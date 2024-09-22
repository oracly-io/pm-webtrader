import { useState } from 'react'

import { useCallAt } from './useCallAt'

export const useRenderAt = (unixTS) => {
  const [rendered, setRendered] = useState(false)
  useCallAt(() => { setRendered(rendered => !rendered) }, unixTS)
  return rendered
}