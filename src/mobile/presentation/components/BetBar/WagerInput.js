import React, { useState, useRef, useCallback, useEffect } from 'react'
import cn from 'clsx'
import { isFunction, replace } from 'lodash'
import { useLongPress } from 'use-long-press'
import { add, gt, gte, round, sub, mul } from '@oracly/pm-libs/calc-utils'

import { FeatureToggle } from '@oracly/pm-react-components/app/mobile/components/FeatureToggle'

import { ERC20 } from '@constants'

import { useTranslate } from '@lib/i18n-utils'

import LevelTag from '@components/common/LevelTag'
import Button from '@components/common/Button'
import ActiveRoundDetails from '@components/SVG/ActiveRoundDetails'

import Numpad from './Numpad'

import css from './WagerInput.module.scss'

const MIN_STEP = 0.01

const WagerInput = (props) => {
  const min = props.min
  const max = props.max
  const currency = props.currency

  let initValue = props.initialWager || min
  if (!gte(max, min)) initValue = '0'

  const [wager, setWager] = useState(initValue)
  const [showNumpad, setShowNumpad] = useState(false)

  useEffect(() => {
    let adjwager = gt(wager, min) ? wager : min
    if (!gte(max, min)) adjwager = '0'

    if (wager !== adjwager) {
      setWager(adjwager)
      if (isFunction(props.onChange)) props.onChange(adjwager)
    }
  }, [min, max])

  useEffect(() => {
    setWager(min)
    props.onChange && props.onChange(min)
  }, [min, props.onChange])

  const ref = useRef()
  const intervalId = useRef()

  useEffect(() => {
    const element = ref.current

    // Create a temporary span element to measure text width
    const tempSpan = document.createElement('span')
    tempSpan.id = 'test-subj'

    tempSpan.style.display = 'block'
    tempSpan.style.position = 'absolute'
    tempSpan.style.right = '150px'

    tempSpan.style.bottom = '150px'
    tempSpan.style.backgroundColor = '#ffffff'
    tempSpan.style.zIndex = '150'
    tempSpan.style.fontSize = '20px'

    document.body.appendChild(tempSpan)

    // Define the minimum and maximum font sizes
    const minFontSize = 10
    const maxFontSize = 20

    // Set initial font size to maxFontSize
    let fontSize = maxFontSize
    element.style.fontSize = fontSize + 'px'

    // Measure the width of the text
    tempSpan.textContent = wager
    let textWidth = tempSpan.offsetWidth

    // Get the width of the input field
    const inputWidth = ref.current.clientWidth

    // Reduce font size until the text fits within the input field
    while (textWidth > inputWidth && fontSize > minFontSize) {
      fontSize--
      element.style.fontSize = fontSize + 'px'
      tempSpan.style.fontSize = fontSize + 'px'
      textWidth = tempSpan.offsetWidth
    }

    document.body.removeChild(tempSpan)
  }, [wager])

  const setAdjustedWager = useCallback(
    (newvalue) => {
      if (gte(newvalue, min) && gte(max, newvalue)) {
        setWager(newvalue)
        if (isFunction(props.onChange)) props.onChange(newvalue)
      } else if (gt(min, newvalue)) {
        setWager(min)
        finishLongPress()
        if (isFunction(props.onChange)) props.onChange(min)
      } else if (gt(newvalue, max)) {
        setWager(max)
        finishLongPress()
        if (isFunction(props.onChange)) props.onChange(max)
      }
    },
    [max, min, props.onChange]
  )

  const t = useTranslate()

  const controlDisabled = props.disabled || gt(min, max)
  const downcontrolDisabled = controlDisabled || gt(min, sub(wager, MIN_STEP))

  const upcontrolDisabled = controlDisabled || gt(add(wager, MIN_STEP), max)

  const handleOnWagerClick = useCallback(() => {
    setShowNumpad(!showNumpad)
  }, [setShowNumpad, showNumpad])

  const handleControlUpClick = useCallback(
    (localWager) => {
      if (upcontrolDisabled) return
      setAdjustedWager(add(localWager, MIN_STEP))
    },
    [setAdjustedWager, upcontrolDisabled]
  )

  const handleControlDownClick = useCallback(
    (localWager) => {
      if (downcontrolDisabled) return
      setAdjustedWager(sub(localWager, MIN_STEP))
    },
    [setAdjustedWager, downcontrolDisabled]
  )

  const handleLongPress = useCallback(
    (action, increment) => {
      let localWager = Number(wager)
      let step = MIN_STEP
      let tickCount = 0

      intervalId.current = setInterval(() => {
        action(localWager)

        localWager = increment ? add(localWager, step) : sub(localWager, step)

        if (tickCount > 4 && step < 100) {
          step = mul(step, 5)
          tickCount = 0
        } else {
          tickCount++
        }
      }, 300)
    },
    [wager]
  )

  const finishLongPress = useCallback(() => {
    if (intervalId.current) {
      clearInterval(intervalId.current)
    }
  }, [intervalId])

  const bindUpEvent = useLongPress(
    () => handleLongPress(handleControlUpClick, true),
    {
      onFinish: () => finishLongPress(),
      onCancel: () => finishLongPress(),
      threshold: 500, // In milliseconds
      captureEvent: true, // Event won't get cleared after React finish processing it
      cancelOnMovement: 25, // Square side size (in pixels) inside which movement won't cancel long press
      cancelOutsideElement: true, // Cancel long press when moved mouse / pointer outside element while pressing
      detect: 'pointer', // Default option
    }
  )

  const bindDownEvent = useLongPress(
    () => handleLongPress(handleControlDownClick, false),
    {
      onFinish: () => finishLongPress(),
      onCancel: () => finishLongPress(),
      threshold: 500, // In milliseconds
      captureEvent: true, // Event won't get cleared after React finish processing it
      cancelOnMovement: 25, // Square side size (in pixels) inside which movement won't cancel long press
      cancelOutsideElement: true, // Cancel long press when moved mouse / pointer outside element while pressing
      detect: 'pointer', // Default option
    }
  )

  const onchange = useCallback((symbol) => {
    let value = `${wager}${symbol}`
    value = replace(value, ',' , '.')
    value = replace(value, /[^\d.]/, '')

    const dp = ERC20.DECIMALS[currency]
    if (!value.endsWith('.')) value = round(value, dp, 0)

    setWager(value)
  }, [currency, wager])

  const onbackspace = useCallback(() => {
    let value = wager
    if (value.length === 1) {
      setWager('0')
      return
    }
    setWager(value.slice(0, -1))
  }, [wager])

  const closeNumpad = useCallback(() => {
    setAdjustedWager(wager)
    setShowNumpad(false)
  }, [wager])

  return (
    <div className={css.container}>
      <FeatureToggle title="Chart settings" />
      <div className={cn(css.deposit, props.className)}>
        <label className={css.label}>
          <span className={css.value}>{t('Deposit')}</span>
          <LevelTag game={props.game} className={css.level} />
        </label>
        <div className={css.content}>
          <span
            className={css.outherControl}
            onClick={() => handleControlDownClick(wager)}
            {...bindDownEvent()}
          >
            <span
              className={cn(css.control, {
                [css.disabled]: downcontrolDisabled,
              })}
            >
              <span />
            </span>
          </span>
          <div onClick={handleOnWagerClick} ref={ref} className={css.input}>
            {wager}
          </div>
          <span
            className={css.outherControl}
            onClick={() => handleControlUpClick(wager)}
            {...bindUpEvent()}
          >
            <span
              className={cn(css.control, { [css.disabled]: upcontrolDisabled })}
            >
              <span />
              <span />
            </span>
          </span>
        </div>
      </div>
      <Button onClick={props.openRoundInfo}>
        <ActiveRoundDetails />
      </Button>
      <Numpad close={closeNumpad} onBackspace={onbackspace} onChange={onchange} isOpen={showNumpad}/>
    </div>
  )
}

export default React.memo(WagerInput)
