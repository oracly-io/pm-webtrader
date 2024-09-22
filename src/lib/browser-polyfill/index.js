// NOTE: Workaround Uniswap Widget error 'ReferenceError: Browser is not defined'
// https://github.com/Uniswap/widgets/issues/627#issuecomment-1930627298
window.Browser = {
  T: () => {} // eslint-disable-line
}

