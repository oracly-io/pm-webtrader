import { combine } from '@state/reducer/utils'

import theme from './theme'
import connection from './connection'
import status from './status'
import network from './network'

export default combine({
  theme,
  connection,
  status,
  network,
})
