import React, { Fragment }  from 'react'
import PropTypes from 'prop-types'
import { isEmpty, map } from 'lodash'
import { Emoji, EmojiStyle } from 'emoji-picker-react'
import cn from 'clsx'
import { formatUnixTS, toLocalStringUnixTS } from '@oracly/pm-libs/date-utils'
import { htmlAddress } from '@oracly/pm-libs/html-utils'

import { GENERIC_MSG } from '@constants'

import { isUsername, isEmoji, isRegular, isSpace, isGif } from '@state/mappers'
import { toContent } from '@state/mappers'

import css from './SelfMessage.module.scss'

export const SelfMessage = ({ message, bettor, onUsernameClick }) => {

  if (isEmpty(message) || isEmpty(message.content)) return null
  if (message.type !== GENERIC_MSG) return null

  return (
    <div className={cn(css.message, { [css.phantom]: message.phantom })}>
      <div className={css.inner}>
        <div className={css.notation}>
          <div
            className={css.timestamp}
            title={toLocalStringUnixTS(message.timestamp)}
          >
            {formatUnixTS(message.timestamp, 'p')}
          </div>
        </div>

        <div className={css.content}>
          <div className={css.text}>
            {map(message.words, (word, idx) =>
              <Fragment key={idx}>

                {isUsername(word) &&
                  <span
                    key={idx}
                    className={cn(css.username, { [css.iam]: toContent(word) === bettor })}
                    data-username={toContent(word)}
                    onClick={onUsernameClick}
                  >
                    <span>{htmlAddress(word)}</span>
                    <span>{word}</span>
                  </span>
                }

                {isEmoji(word) &&
                  <Emoji
                    unified={toContent(word)}
                    emojiStyle={EmojiStyle.NATIVE}
                    size={22}
                  />
                }

                {isGif(word) &&
                  <div className={css.gif} style={{ backgroundImage: `url(${toContent(word)})` }}>
                    {word}
                  </div>
                }

                {(isRegular(word) || isSpace(word)) &&
                  toContent(word)
                }

              </Fragment>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}

SelfMessage.propTypes = {
  message: PropTypes.object.isRequired,
  bettor: PropTypes.string.isRequired,
  onUsernameClick: PropTypes.func.isRequired,
}

export default React.memo(SelfMessage)
