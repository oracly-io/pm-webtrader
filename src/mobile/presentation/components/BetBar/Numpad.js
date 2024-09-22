import React from 'react'
import cn from 'clsx'

import Backspace from '@components/SVG/Backspace'
import NumpadDone from '@components/SVG/NumpadDone'

import css from './Numpad.module.scss'

const ButtonTypes = {
  numberButton: 'numberButton',
  actionButton: 'actionButton',
}

const ActionTypes = {
  backSpace: 'backSpace',
  done: 'done',
}

const Numpad = (props) => {
  const buttons = {
    rows: [
      [
        {
          type: ButtonTypes.numberButton,
          value: 1,
          label: '1',
        },
        {
          type: ButtonTypes.numberButton,
          value: 2,
          label: '2',
        },
        {
          type: ButtonTypes.numberButton,
          value: 3,
          label: '3',
        },
        {
          type: ButtonTypes.numberButton,
          value: 4,
          label: '4',
        },
        {
          type: ButtonTypes.numberButton,
          value: 5,
          label: '5',
        },
        {
          type: ButtonTypes.numberButton,
          value: '.',
          label: '•',
        },
        {
          type: ButtonTypes.actionButton,
          actionType: ActionTypes.backSpace,
          label: <Backspace />,
        },
      ],
      [
        {
          type: ButtonTypes.numberButton,
          value: 6,
          label: '6',
        },
        {
          type: ButtonTypes.numberButton,
          value: 7,
          label: '7',
        },
        {
          type: ButtonTypes.numberButton,
          value: 8,
          label: '8',
        },
        {
          type: ButtonTypes.numberButton,
          value: 9,
          label: '9',
        },
        {
          type: ButtonTypes.numberButton,
          value: 0,
          label: '0',
        },
        {
          type: ButtonTypes.actionButton,
          actionType: ActionTypes.done,
          big: true,
          label: <NumpadDone />,
        },
      ],
    ],
  }

  const onClick = (item) => {
    switch (item.type) {
      case ButtonTypes.numberButton:
        props.onChange(item.value)
        return
      case ButtonTypes.actionButton:
        if (item.actionType === ActionTypes.done) {
          props.close()
        }
        if (item.actionType === ActionTypes.backSpace) {
          props.onBackspace()
        }
        return
      default:
        return
    }
  }

  return (
    <div className={cn(css.container, { [css.open]: props.isOpen })}>
      {buttons.rows.map((row, index) => (
        <div key={`row-${index}`} className={css.buttonsRow}>
          {row.map((item, index) => (
            <div
              onClick={() => onClick(item)}
              key={item.type + index}
              className={cn(css.button, { [css.bigbutton]: item.big })}
            >
              {item.label}
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

export default React.memo(Numpad)
