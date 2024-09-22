import React from 'react'

import COIN_DEMO_GOLD from '@static/images/COIN_DEMO_GOLD.png'
import COIN_DEMO_SILVER from '@static/images/COIN_DEMO_SILVER.png'

import COIN_USDC_GOLD from '@static/images/COIN_USDC_GOLD.png'
import COIN_USDC_SILVER from '@static/images/COIN_USDC_SILVER.png'

import COIN_UNKNOWN from '@static/images/COIN_UNKNOWN.png'

export const DEMO_GOLD = () => (
  <img src={COIN_DEMO_GOLD} width="100%" height="100%" alt="COIN_DEMO_GOLD" />
)

export const DEMO_SILVER = () => (
  <img src={COIN_DEMO_SILVER} width="100%" height="100%" alt="COIN_DEMO_SILVER" />
)

export const USDC_GOLD = () => (
  <img src={COIN_USDC_GOLD} width="100%" height="100%" alt="COIN_USDC_GOLD" />
)

export const USDC_SILVER = () => (
  <img src={COIN_USDC_SILVER} width="100%" height="100%" alt="COIN_USDC_SILVER" />
)

export const UNKNOWN = () => (
  <img src={COIN_UNKNOWN} width="100%" height="100%" alt="COIN_UNKNOWN" />
)
