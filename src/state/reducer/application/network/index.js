import { APPLICATION_NETWORK_STATUS } from '@state/actions'

export default {

  [APPLICATION_NETWORK_STATUS]: (state, { status }) => {
    return {
      ...state,
      status,
    }
  },

}
