import { Token, NativeCurrency } from '@uniswap/sdk-core'

import { NATIVE } from '@constants'

export class Matic extends NativeCurrency {

  static #cache = {}
  static #wrapped = new Token(
    NATIVE.CHAIN,
    NATIVE.WRAPPED.ADDRESS,
    NATIVE.WRAPPED.DECIMALS,
    NATIVE.WRAPPED.SYMBOL,
    NATIVE.WRAPPED.DESCRIPTION,
  )

  static onChain(chainId) {
    return Matic.#cache[chainId] ?? (Matic.#cache[chainId] = new Matic())
  }

  constructor() {
    super(
      NATIVE.CHAIN,
      NATIVE.DECIMALS,
      NATIVE.SYMBOL,
      NATIVE.NAME,
    )
  }

  get wrapped() {
    return Matic.#wrapped
  }

  equals(other) {
    return other.isNative && other.chainId === this.chainId
  }

}
