import React from 'react'
import ProfileBar from '@oracly/pm-react-components/app/mobile/components/ProfileBar'

import Button from '@components/common/Button'
import DoubleArrowsIcon from '@components/SVG/DoubleArrows'
import ChatIcon from '@components/SVG/Chat'
import GamePinBar from '@components/GamePinBar'

import css from './Header.module.scss'

const cashDropdownPopperStyles = { left: '8px' }

const Header = ({
  balance,
  currency,
  account,
  isConnected,
  networkStatus,
  onProfileIconClick,
  onProfileCurrencyChanged,
  onChatClick,
  onPredictionsClick,
}) => {
  return (
    <div className={css.container}>
      {isConnected ? (
        <div className={css.inner}>
          <Button className={css.button} onClick={onPredictionsClick}>
            <DoubleArrowsIcon />
          </Button>
          <ProfileBar
            balance={balance}
            currency={currency}
            account={account}
            networkStatus={networkStatus}
            cashDropdownPopperStyles={cashDropdownPopperStyles}
            onIconClick={onProfileIconClick}
            onCurrencyChanged={onProfileCurrencyChanged}
          />
          <Button className={css.button} onClick={onChatClick}>
            <ChatIcon />
          </Button>
        </div>
      ) : null}
      <GamePinBar />
    </div>
  )
}

export default React.memo(Header)
