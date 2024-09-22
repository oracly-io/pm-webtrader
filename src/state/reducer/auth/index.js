import { set, del } from '@oracly/pm-libs/immutable'
import { success } from '@oracly/pm-libs/redux-cqrs'

import { REQUEST_AUTHENTICATION_PSIG } from '@actions'
import { RESET_AUTHENTICATION_PSIG } from '@actions'

export default {

  metadata: {
    persist: 'shared'
  },

  [success(REQUEST_AUTHENTICATION_PSIG)]: (state, { from, nickname, result }) => {
    return set(state, [from, nickname || from, 'psig'], result)
  },

  [success(RESET_AUTHENTICATION_PSIG)]: (state, { from, nickname }) => {
    return del(state, [from, nickname || from, 'psig'])
  },

}

