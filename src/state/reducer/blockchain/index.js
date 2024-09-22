import { combine } from '@state/reducer/utils'

import blocks from './blocks'
import transactions from './transactions'

export default combine({
  blocks,
  transactions,
})

