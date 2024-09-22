import React, { useCallback, useEffect, useState, useRef, useMemo } from 'react'
import PropTypes from 'prop-types'
import cn from 'clsx'
import { usePopper } from 'react-popper'

import DropdownIcon from '@components/SVG/DropdownIcon'

import DropdownOption from './DropdownOption'
import { getModifiers } from './Dropdown.utils'

import css from './Dropdown.module.scss'

const Dropdown = ({
  containerClassName,
  headerClassName,
  bodyClassName,
  valueClassName,
  iconClassName,
  optionClassName,
  iconColor,
  options,
  value,
  onChange,
  valueRenderer = (value) => value.label,
  optionRenderer,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const containerElement = useRef(null)
  const [referenceElement, setReferenceElement] = useState(null)
  const [popperElement, setPopperElement] = useState(null)
  const modifiers = useMemo(() => getModifiers({ isOpen }), [isOpen])
  const { styles, attributes } = usePopper(referenceElement, popperElement, { modifiers })

  const handleClick = useCallback(() => {
    setIsOpen((isOpen) => !isOpen)
  }, [])

  const handleChange = useCallback((option) => {
    setIsOpen(false)
    onChange(option)
  }, [onChange])

  useEffect(() => {
    const handler = (e) => {
      if (containerElement.current && !containerElement.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    window.addEventListener('click', handler)
    return () => {
      window.removeEventListener('click', handler)
    }
  }, [])

  return (
    <div ref={containerElement} className={cn(css.container, containerClassName)}>
      <div className={cn(css.header, headerClassName)} ref={setReferenceElement} onClick={handleClick}>
        <div className={cn(css.value, valueClassName)}>{value && valueRenderer(value)}</div>
        <div className={cn(css.icon, iconClassName)}><DropdownIcon fill={iconColor} /></div>
      </div>

      <div className={cn(css.body, bodyClassName)} ref={setPopperElement} style={styles.popper} {...attributes.popper}>
        {options.map((option, index) => (
          <DropdownOption
            key={index}
            className={optionClassName}
            option={option}
            onClick={handleChange}
            renderer={optionRenderer}
          />
        ))}
      </div>
    </div>
  )
}

Dropdown.propTypes = {
  containerClassName: PropTypes.string,
  headerClassName: PropTypes.string,
  bodyClassName: PropTypes.string,
  valueClassName: PropTypes.string,
  iconClassName: PropTypes.string,
  optionClassName: PropTypes.string,
  iconColor: PropTypes.string,
  options: PropTypes.array,
  value: PropTypes.any,
  onChange: PropTypes.func,
  valueRenderer: PropTypes.func,
  optionRenderer: PropTypes.func,
}

export default React.memo(Dropdown)