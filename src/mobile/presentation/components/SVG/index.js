import Clock from '@components/SVG/Clock'

const svgs = {
  clock: Clock,
}

export function getSVGComponent(name) {
  return svgs[name] || null
}