import React from 'react'
import PropTypes from 'prop-types'

const DropdownIcon = ({ fill = 'black' }) => {
  return (
    <svg width="8" height="6" viewBox="0 0 8 6" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3.33407 5.0002L0.860649 2.4002C0.559399 2.08353 0.492014 1.72103 0.658494 1.3127C0.824974 0.904362 1.12226 0.700195 1.55035 0.700195H6.44962C6.87772 0.700195 7.175 0.904362 7.34148 1.3127C7.50796 1.72103 7.44058 2.08353 7.13933 2.4002L4.66591 5.0002C4.57078 5.1002 4.46772 5.1752 4.35673 5.2252C4.24574 5.2752 4.12683 5.3002 3.99999 5.3002C3.87315 5.3002 3.75423 5.2752 3.64325 5.2252C3.53226 5.1752 3.4292 5.1002 3.33407 5.0002Z" fill={fill}/>
    </svg>
  )
}

DropdownIcon.propTypes = {
  fill: PropTypes.string,
}

export default DropdownIcon