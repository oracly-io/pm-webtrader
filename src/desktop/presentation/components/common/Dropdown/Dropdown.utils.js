export const getModifiers = ({isOpen }) => {
  return [
    { name: 'eventListeners', options: { scroll: false } },
    {
      name: 'sameWidth',
      enabled: true,
      phase: 'beforeWrite',
      requires: ['computeStyles'],
      fn: ({ state }) => {
        state.styles.popper.minWidth = `${state.rects.reference.width}px`
      },
      effect: ({ state }) => {
        state.elements.popper.style.minWidth = `${
          state.elements.reference.offsetWidth
        }px`
      }
    },
    {
      name: 'body-position',
      enabled: true,
      phase: 'beforeWrite',
      requires: ['computeStyles'],
      fn: ({ state }) => {
        state.styles.popper.top = `-${state.rects.reference.height}px`
      },
    },
    {
      name: 'toggle',
      enabled: true,
      phase: 'beforeWrite',
      requires: ['computeStyles'],
      fn: ({ state }) => {
        state.styles.popper.visibility = isOpen ? 'visible' : 'hidden'
        state.styles.popper.pointerEvents = isOpen ? 'all' : 'none'
      },
    }
  ]
}