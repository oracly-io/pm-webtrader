import React, { useCallback, useState } from 'react'
import { createContext, useContext } from 'react'

const PriceContext = createContext(null)

export const usePriceContext = () => useContext(PriceContext)

export const PriceProvider = ({ children }) => {
  const [expanded, setExpanded] = useState()

  const toggleExpand = useCallback(() => setExpanded((expanded) => !expanded), [])

  return (
    <PriceContext.Provider value={{ expand: toggleExpand, expanded }}>
      {children}
    </PriceContext.Provider>
  )
}