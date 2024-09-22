import UNKNOWN from './EN'
import EN from './EN'
import HI from './HI'
import ES from './ES'
import ZH from './ZH'
import KO from './KO'
import RU from './RU'

const ICONS = { EN, HI, ES, ZH, KO, RU }

export const getIconByChannel = (channel = '') => {
  const code = channel.split(':').at(-1)
  return ICONS[code.toUpperCase()] || UNKNOWN
}