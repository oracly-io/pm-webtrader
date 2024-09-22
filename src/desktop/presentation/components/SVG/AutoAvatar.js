import React from 'react'
import { head, replace } from 'lodash'
import { colorHash } from '@oracly/pm-libs/hash-utils'

const getFirstLetterAddrress = (value) => head(replace(value, '0x', ''))

const Avatar = ({ name, className }) => (

  <svg width="38" height="38" viewBox="0 0 38 38" fill={colorHash(name)} xmlns="http://www.w3.org/2000/svg" className={className}>
    <circle cx="19" cy="19" r="19" />
    <text x="50%" y="50%" dominantBaseline="central" textAnchor="middle" fill="white" fontSize="17" fontWeight="400">{getFirstLetterAddrress(name)}</text>
  </svg>

)

export default React.memo(Avatar)
