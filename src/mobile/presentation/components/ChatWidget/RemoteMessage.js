import React, { useCallback, Fragment } from 'react'
import PropTypes from 'prop-types'
import { isEmpty, map } from 'lodash'
import { Emoji, EmojiStyle } from 'emoji-picker-react'
import cn from 'clsx'
import { formatUnixTS, toLocalStringUnixTS } from '@oracly/pm-libs/date-utils'
import { htmlAddress } from '@oracly/pm-libs/html-utils'

import { connect } from '@state'
import { isChatReady } from '@state/getters'

import { isUsername, isEmoji, isRegular, isSpace, isGif, toContent } from '@state/mappers'
import { getAccountNickname } from '@state/getters'

import Reply from '@components/SVG/Reply'

import Avatar from '@components/common/Avatar'

import css from './RemoteMessage.module.scss'

export const RemoteMessage = ({ message, nickname, bettor, isChatReady, onUsernameClick }) => {

  const append = useCallback(() => {
    const input = document.getElementById('chat-message-input')
    if (isEmpty(input) && isChatReady) return

    input.appendText('@' + message.sender)

  }, [message.sender, isChatReady])

  if (isEmpty(message) || isEmpty(message.content)) return null

  return (
    <div className={cn(css.message, { [css.phantom]: message.phantom })}>

        <Avatar address={message.sender} className={css.avatar} />

        <div className={css.inner}>

          <div className={css.notation}>
            <div className={css.sender}>
              {nickname || htmlAddress(message.sender)}
            </div>
            <div className={css.address}>
              {'@' + message.sender}
            </div>
            <div
              className={css.timestamp}
              title={toLocalStringUnixTS(message.timestamp)}
            >
              {formatUnixTS(message.timestamp, 'p')}
            </div>
          </div>

          <div className={css.content}>

            <div className={css.textcontent}>
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

            <div
              className={cn(css.reply, { [css.enabled]: isChatReady })}
              onClick={append}
            >
              <Reply />
            </div>

          </div>
        </div>

    </div>
  )
}

RemoteMessage.propTypes = {
  message: PropTypes.object.isRequired,
  bettor: PropTypes.string.isRequired,
  onUsernameClick: PropTypes.func.isRequired,

  nickname: PropTypes.string,
}

export default connect(
  (state, props) => ({
    isChatReady: isChatReady(state),
    nickname: getAccountNickname(state, props.message?.sender),
  })
)(React.memo(RemoteMessage))
