import React, { useEffect } from 'react'
import { isString } from 'lodash'
import cn from 'clsx'
import { htmlAddress } from '@oracly/pm-libs/html-utils'

import { getAccountNickname } from '@state/getters'

import { connect } from '@state'
import { RESOVLE_ADDRESS_TO_NICKNAME } from '@actions'

import css from './nickname.module.scss'

const Nickname = ({
  address, nickname, className
, RESOVLE_ADDRESS_TO_NICKNAME

}) => {

  useEffect(() => {
    if (address && !isString(nickname)) RESOVLE_ADDRESS_TO_NICKNAME({ address })
  }, [nickname, address])

  return <span
    title={nickname || address}
    className={cn(className, css.nickname)}
  >
    {nickname || htmlAddress(address)}
  </span>
}

export default connect(
  (state, props) => ({
    nickname: getAccountNickname(state, props.address)
  }),
  ({ command, query }) => [
    query(RESOVLE_ADDRESS_TO_NICKNAME),
  ]
)(React.memo(Nickname))

