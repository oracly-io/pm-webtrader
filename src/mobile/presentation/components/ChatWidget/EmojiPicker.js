import React, { useCallback } from 'react'
import { isEmpty, isFunction } from 'lodash'
import EmojiPicker, {
  EmojiStyle,
  SkinTones,
  Theme,
  SuggestionMode,
} from 'emoji-picker-react'
import PropTypes from 'prop-types'

import CloseIcon from '@components/SVG/RoundListClose'

import css from './Chat.module.scss'

const Picker = (props) => {

  const onPicked = useCallback((emojiData, event) => {

    if (isFunction(props.onPicked) && !isEmpty(emojiData)) {
      props.onPicked(emojiData)
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
      <EmojiPicker
        onEmojiClick={onPicked}
        autoFocusSearch={false}
        theme={Theme.DARK}
        height={360}
        previewConfig={{ showPreview: false }}
        suggestedEmojisMode={SuggestionMode.FREQUENT}
        skinTonesDisabled
        defaultSkinTone={SkinTones.NEUTRAL}
        emojiStyle={EmojiStyle.NATIVE}

        // TODO: this will work after migrate to contenteditable=true
        // customEmojis={[
        //   {
        //     names: ['Film'],
        //     imgUrl: 'https://cdn.jsdelivr.net/npm/eva-icons/fill/svg/film.svg',
        //     id: 'film'
        //   },
        //   {
        //     names: ['Bar Chart'],
        //     imgUrl:
        //       'https://cdn.jsdelivr.net/npm/eva-icons/fill/svg/bar-chart.svg',
        //     id: 'bar_chart'
        //   },
        //   {
        //     names: ['champagne', 'bottle', 'sparkling wine'],
        //     imgUrl:
        //       'https://cdn.jsdelivr.net/gh/hfg-gmuend/openmoji/src/food-drink/drink/1F37E.svg',
        //     id: 'champagne'
        //   }
        // ]}
        // searchDisabled
        // skinTonePickerLocation={SkinTonePickerLocation.PREVIEW}
        // width="50%"
        // emojiVersion="0.6"
        // lazyLoadEmojis={true}
        // searchPlaceHolder="Filter"
        // categories={[
        //   {
        //     name: 'Fun and Games',
        //     category: Categories.ACTIVITIES
        //   },
        //   {
        //     name: 'Smiles & Emotions',
        //     category: Categories.SMILEYS_PEOPLE
        //   },
        //   {
        //     name: 'Flags',
        //     category: Categories.FLAGS
        //   },
        //   {
        //     name: 'Yum Yum',
        //     category: Categories.FOOD_DRINK
        //   }
        // ]}
      />
    </div>
  )
}

Picker.propTypes = {
  onClose: PropTypes.func,
  onPicked: PropTypes.func.isRequired,
}

export default React.memo(Picker)

