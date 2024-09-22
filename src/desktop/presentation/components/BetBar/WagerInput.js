import React, { useState, useRef, useCallback, useEffect } from 'react'
import cn from 'clsx'
import { isFunction, isElement, replace } from 'lodash'
import { add, gt, gte, round, sub } from '@oracly/pm-libs/calc-utils'

import { ERC20 } from '@constants'
import { useTranslate } from '@lib/i18n-utils'

import css from './WagerInput.module.scss'

const WagerInput = (props) => {

  const min = props.min
  const max = props.max
  const currency = props.currency

  let initValue = props.initialWager || min
  if (!gte(max, min)) initValue = '0'

  const [wager, setWager] = useState(initValue)

  useEffect(() => {
    setWager(min)
    props.onChange && props.onChange(min)
  }, [min, props.onChange])

  useEffect(() => {
    let adjwager = gt(wager, min) ? wager : min
    if (!gte(max, min)) adjwager = '0'

    if (wager !== adjwager) {
      setWager(adjwager)
      if (isFunction(props.onChange)) props.onChange(adjwager)
    }
  },
  [
    min,
    max,
  ])

  const refInput = useRef()
  useEffect(() => {
    const el = refInput.current
    if (!isElement(el)) return
    const focusable = document.activeElement.tagName !== 'TEXTAREA'
    if (!focusable) return

    props.disabled
      ? el.blur()
      : el.focus()

  }, [refInput.current, props.disabled])

  const onchange = useCallback(() => {
    let value = refInput.current?.value
    value = replace(value, ',' , '.')
    value = replace(value, /[^\d.]/, '')

    const dp = ERC20.DECIMALS[currency]
    if (!value.endsWith('.')) value = round(value, dp, 0)

    setWager(value)
  }, [currency])

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

  const t = useTranslate()

  const controlDisabled = props.disabled || gt(min, max)
  const downcontrolDisabled = controlDisabled || gt(min, sub(wager, 1))
  const upcontrolDisabled = controlDisabled || gt(add(wager, 1), max)

  const handleControlUpClick = useCallback((e) => {
    if (upcontrolDisabled) return
    setAdjustedWager(add(wager, 1))
  }, [setAdjustedWager, wager, upcontrolDisabled])

  const handleControlDownClick = useCallback((e) => {
    if (downcontrolDisabled) return
    setAdjustedWager(sub(wager, 1))
  }, [setAdjustedWager, wager, downcontrolDisabled])

  return (
    <div className={cn(css.container, props.className)}>
      <label className={css.label}>
        <span className={css.value}>{t('Deposit')}</span>
        <span className={css.currency}>{currency || t('UNKNOWN')}</span>
      </label>
      <div className={css.content}>
        <span
          className={cn(css.control, { [css.disabled]: downcontrolDisabled } )}
          onClick={handleControlDownClick}
        ><span/></span>
        <input
          ref={refInput}
          className={css.input}
          onChange={onchange}
          onBlur={onblur}
          value={wager}
        />
        <span
          className={cn(css.control, { [css.disabled]: upcontrolDisabled } )}
          onClick={handleControlUpClick}
        ><span/><span/></span>
      </div>
    </div>
  )

}

export default React.memo(WagerInput)
