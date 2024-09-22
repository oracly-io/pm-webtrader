import React, { useCallback } from 'react'
import { isFunction } from 'lodash'
import cn from 'clsx'

import { SET_SHOW_STATISTICS_BAR } from '@actions'

import { connect } from '@state'

import { toAccountAvatarUrl } from '@utils'

import css from './Avatar.module.scss'

const Avatar = ({
  className,
  address,
  onClick,
  SET_SHOW_STATISTICS_BAR,
}) => {

  const openProfileStats = useCallback(() =>
    SET_SHOW_STATISTICS_BAR({ account: address, isOpened: true })
  , [address])

  if (!isFunction(onClick)) onClick = openProfileStats

  return <div
    title={address}
    onClick={onClick}
    className={cn('ava', css.avatar, className)}
    style={{
      backgroundImage: `url(${toAccountAvatarUrl(address)})`,
      backgroundSize: 'cover'
    }}
  />
}

export default connect(
  null,
  ({ command }) => [
    command(SET_SHOW_STATISTICS_BAR),
  ]
)(React.memo(Avatar))
