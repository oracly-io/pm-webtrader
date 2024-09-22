import React from 'react'
import PropTypes from 'prop-types'

import { factoryClaims } from '@components/SVG/currency/claims'

import css from '@styles/components/common/currency/claim.module.scss'

const Claim = ({ currency }) => {

  const Currency = factoryClaims(currency)

  return (
    <div className={css.claim}>
      <Currency />
    </div>
  )

}

Claim.propTypes = {
  currency: PropTypes.string
}

export default React.memo(Claim)
