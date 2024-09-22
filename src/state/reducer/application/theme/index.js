import { APPLICATION_THEMES, DARK_THEME } from '@constants'
import { SET_THEME } from '@actions'

export default {

  metadata: {
    persist: 'short',
    default: DARK_THEME
  },

  [SET_THEME]: (state, { theme }) => {
    if (!(theme in APPLICATION_THEMES)) return state

    return theme
  }

}

