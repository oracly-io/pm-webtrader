import { CONNECTION_LOST, CONNECTION_ESTABLISHED } from '@state/actions'

export default {

  metadata: {
    default: {
      isOnline: null
    }
  },

  [CONNECTION_LOST]: (state) => {
    return {
      isOnline: false,
    }
  },

  [CONNECTION_ESTABLISHED]: (state) => {
    return {
      isOnline: true,
    }
  }

}
