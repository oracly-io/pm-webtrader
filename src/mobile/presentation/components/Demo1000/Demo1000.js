import React, { useCallback } from 'react'
import { isEmpty } from 'lodash'
import cn from 'clsx'
import AnimatedButton from '@oracly/pm-react-components/app/mobile/components/common/AnimatedButton'
import { lt } from '@oracly/pm-libs/calc-utils'
import { hexHash } from '@oracly/pm-libs/hash-utils'
import { htmlCurrency, htmlCurrencyNamed } from '@oracly/pm-libs/html-utils'

import config from '@config'

import Coin from '@components/common/Coin'

import { connect } from '@state'
import { getPendingTransactionsByEntityId } from '@state/getters'
import { getAsyncStatus, getActiveAccountAddress } from '@state/getters'
import { isInProgress, isSucceed } from '@state/async'

import { getGameById, getActiveGameId } from '@state/getters'
import { getActiveCurrency, getActiveAccountBalance } from '@state/getters'
import { getActiveAccountGas } from '@state/getters'

import { DEMO } from '@constants'
import { MINT_DEMO_1000 } from '@actions'

import css from './Demo1000.module.scss'

const Demo1000 = (props) => {
  const confirming = props.minting || props.confirmingMinting
  const mintDemo1000 = useCallback(() => {
    props.MINT_DEMO_1000()
  }, [])

  if (!props.account) return null
  if (props.currency !== DEMO) return null
  if (!props.balance && props.balance !== 0) return null

  const insufficientBalance = lt(props.balance, props.game?.minWager)
  const insufficientGas = lt(props.gas, config.low_gas)
  if (!insufficientBalance) return null
  if (insufficientGas) return null

  // NOTE: Do not render after succeed minting
  if (!confirming && props.successMinting) return null

  return (
    <AnimatedButton
      className={cn(css.animatedBtn)}
      onClick={mintDemo1000}
      hoverBorderOpacity={0.43}
      activeBorderCircle={0.62}
      disabled={confirming}
    >
      <div
        className={cn(css.container, css.green, {
          [css.disabled]: confirming,
          propagating: confirming,
        })}
      >
        <div className={css.gradient} />
        <div className={css.content} title={htmlCurrencyNamed(1000, DEMO)}>
          <Coin
            className={cn(css.coin, css.green)}
            type={'green'}
            currency={DEMO}
          />
          <span className={css.amount}>+{htmlCurrency(1000)}</span>
        </div>
      </div>
    </AnimatedButton>
  )
}

export default connect(
  (state, props) => ({
    gas: getActiveAccountGas(state),
    game: getGameById(state, getActiveGameId(state)),
    currency: getActiveCurrency(state),
    account: getActiveAccountAddress(state),
    balance: getActiveAccountBalance(state, getActiveCurrency(state)),

    minting: !isEmpty(
      getPendingTransactionsByEntityId(state, hexHash({ MINT_DEMO_1000 }))
    ),
    confirmingMinting: isInProgress(getAsyncStatus(state, MINT_DEMO_1000)),
    successMinting: isSucceed(getAsyncStatus(state, MINT_DEMO_1000)),
  }),
  ({ query }) => [query(MINT_DEMO_1000)]
)(React.memo(Demo1000))
