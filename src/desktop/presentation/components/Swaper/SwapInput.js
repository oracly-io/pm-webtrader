import React, { useState, useRef, useCallback, useEffect } from 'react'
import cn from 'clsx'
import { isFunction, isElement, replace } from 'lodash'
import { gt, gte, round, MAX_INT_256 } from '@oracly/pm-libs/calc-utils'

import { ERC20 } from '@constants'

import css from './SwapInput.module.scss'

const SwapInput = (props) => {

  const min = props.min || '0'
  const max = props.max || MAX_INT_256
  const erc20 = props.erc20
  const dp = ERC20.DECIMALS[ERC20[erc20]]

  let initValue = String(props.initValue || 0)
  if (!gte(max, min)) initValue = '0'

  const [wager, setWager] = useState(round(initValue, dp, 0))

  useEffect(() => {
    let adjwager = gt(wager, min) ? wager : min
    if (!gte(max, min)) adjwager = '0'

    if (wager !== adjwager) {
      setWager(adjwager)
      if (isFunction(props.onChange)) props.onChange(adjwager)
    }
  }, [
    min,
    max,
  ])

  const refInput = useRef()

  const onchange = useCallback(() => {
    let value = refInput.current?.value
    value = replace(value, ',' , '.')
    value = replace(value, /[^\d.]/, '')

    if (!value.endsWith('.')) value = round(value, dp, 0)

    setWager(value)
  }, [erc20])

  const setAdjustedWager = useCallback((newvalue) => {
    const el = refInput.current
    if (!isElement(el)) return

    if (gte(newvalue, min) && gte(max, newvalue)) {

      setWager(newvalue)
      if (isFunction(props.onChange)) props.onChange(newvalue)

    } else if (gt(min, newvalue)) {

      setWager(min)
      if (isFunction(props.onChange)) props.onChange(min)

    } else if (gt(newvalue, max)) {

      setWager(max)
      if (isFunction(props.onChange)) props.onChange(max)

    } else {

      el.value = min

    }
  }, [max, min, refInput.current, props.onChange])

  const onblur = useCallback(() => {
    const el = refInput.current
    if (!isElement(el)) return

    if (gt(min, max)) {
      el.value = '0'
      setWager('0')
      if (isFunction(props.onChange)) props.onChange('0')
      return
    }

    const newvalue = el.value
    setAdjustedWager(newvalue)

  }, [max, min, refInput.current, props.onChange, setAdjustedWager])

  return (
    <div className={cn(css.container, props.className)}>
			<input
        disabled={props.disabled}
				ref={refInput}
				className={css.input}
				onChange={onchange}
				onBlur={onblur}
				value={wager}
			/>
    </div>
  )

}

export default React.memo(SwapInput)
