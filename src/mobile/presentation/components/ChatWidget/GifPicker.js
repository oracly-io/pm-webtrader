import React, { useCallback } from 'react'
import PropTypes from 'prop-types'
import { isEmpty, isFunction } from 'lodash'
import GifPicker, { Theme } from 'gif-picker-react'

import config from '@config'

import CloseIcon from '@components/SVG/RoundListClose'

import css from './Chat.module.scss'

const Picker = (props) => {

  const onPicked = useCallback((gif, event) => {

    if (isFunction(props.onPicked) && !isEmpty(gif)) {
      props.onPicked(gif)
    }

  }, [])

  return (
    <div className={css.picker}>
      <div
        onClick={props.onClose}
        className={css.close}
      >
        <CloseIcon />
      </div>
      <GifPicker
        tenorApiKey={config.teron_key}
        onGifClick={onPicked}
        autoFocusSearch={false}
        theme={Theme.DARK}
        height={360}

        // tenorApiKey: string;
        // onGifClick?: (gif: TenorImage) => void;
        // autoFocusSearch?: boolean;
        // contentFilter?: ContentFilter;
        // clientKey?: string;
        // country?: string;
        // locale?: string;
        // width?: number | string;
        // height?: number | string;
        // categoryHeight?: number | string;
        // theme?: Theme;
      />
    </div>
  )
}

Picker.propTypes = {
  onClose: PropTypes.func,
  onPicked: PropTypes.func.isRequired,
}

export default React.memo(Picker)


