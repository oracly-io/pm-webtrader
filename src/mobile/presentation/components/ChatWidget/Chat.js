import React, { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { debounce, isEmpty } from 'lodash'
import cn from 'clsx'
import { Virtuoso } from 'react-virtuoso'
import { nowUnixTS } from '@oracly/pm-libs/date-utils'

import { PING_MSG } from '@constants'
import config from '@config'

import { useTranslate } from '@lib/i18n-utils'

import { useScheduledCommand } from '@hooks'

import { connect } from '@state'
import { getActiveAccountAddress, getSubscribedChatChannels } from '@state/getters'
import { getActiveAccountNickname } from '@state/getters'
import { getChatActiveChannelMessageIds, getChatActiveChannel } from '@state/getters'
import { getActiveAuthPersonalSignature } from '@state/getters'
import { isChatConnected, isChatReady } from '@state/getters'

import { replaceEmojiWithWord } from '@lib/emoji-utils'

import { gifToWord } from '@state/mappers'

import { CHAT_SEND } from '@actions'

import Message from '@components/ChatWidget/Message'
import ButtonProvider from '@components/common/Button'

import EmojiIcon from '@components/SVG/ChatSender'
import GifIcon from '@components/SVG/GifIcon'

import SendButtonIcon from '@components/SVG/ChatSendButton'

import { GENERIC_MSG, SUBSCRIBE_MSG } from '@constants'

import { usePrevious } from '@hooks'

import EmojiPicker from './EmojiPicker'
import GifPicker from './GifPicker'
import ChatHeader from './ChatHeader'

import css from './Chat.module.scss'

function autoresize({ target }) {

  const textarea = target
  if (isEmpty(textarea)) return

  textarea.style.height = ''

  let newHeight = Math.min(textarea.scrollHeight, parseInt(getComputedStyle(textarea).maxHeight))

  textarea.style.height = newHeight + 'px'
}

const VirtuosoList = forwardRef((props, ref) => <div className={css.list} {...props} ref={ref} />)
VirtuosoList.displayName = 'VirtuosoList'
const VirtuosoHeader = () => <div className={css.virtuosoPaddingTop} />

const virtuoso = {
  followOutput: (isAtBottom) => isAtBottom ? 'smooth' : false,
  atTopThreshold: 60,
  components: { List: VirtuosoList, Header: VirtuosoHeader },
  computeItemKey: (index, messageid) => messageid || index,
  alignToBottom: true,
  itemContent: (index, messageid) => (
    <Message
      key={messageid}
      messageid={messageid}
    />
  ),
}

const ChatWidget = (props) => {
  const t = useTranslate()

  const textInput = useRef()
  const virtuosoRef = useRef()

  const [pickingEmoji, setPickingEmoji] = useState(false)
  const [pickingGif, setPickingGif] = useState(false)
  const [headerCollapsed, setHeaderCollapsed] = useState(false)
  const [inputFocused, setInputFocused] = useState(false)
  const [isSendButtonActive, showSendButton] = useState(false)

  const sendMessage = (target) => {
    let content = target.value && target.value.trim()
    if (isEmpty(content)) return
    if (!props.isChatReady) return

    content = replaceEmojiWithWord(content)

    if (!isEmpty(props.psig)) {
      props.CHAT_SEND({
        content,
        sender: props.sender,
        nickname: props.nickname,
        channel: props.channel,
        type: GENERIC_MSG,
        psig: props.psig,
        cts: nowUnixTS(),
      })

      target.setValue && target.setValue('')
      target.style.height = ''
      target.style.overflowY = ''

      target.autoclose && target.autoclose()
      target.autoresize && target.autoresize()

    }

  }

  const handleMessageKey = (e) => {
    if (e.key === 'Enter') {
      if (!e.shiftKey) {
        e.preventDefault()
        e.stopPropagation()
        sendMessage(e.target)
      }
    }
  }
  const handleMessageChange = (e) => { showSendButton(!!e.target.value) }
  const handleSubmit = () => textInput?.current && sendMessage(textInput.current)

  useEffect(() => {

    if (!props.isChatConnected) return

    if (!isEmpty(props.psig) && !props.isChatReady) {
      props.CHAT_SEND({
        sender: props.sender,
        nickname: props.nickname,
        channel: props.channel,
        type: SUBSCRIBE_MSG,
        cts: nowUnixTS(),
        psig: props.psig,
      })
    }

  }, [
    props.sender,
    props.channel,
    props.nickname,
    props.isChatConnected,
    props.isChatReady,
    props.psig,
  ])

  const scrollToIndex = useMemo(() => debounce(
    (...args) => virtuosoRef?.current?.scrollToIndex(...args),
    150
  ), [])

  const prevChannel = usePrevious(props.channel)
  const prevMessageidsSize = usePrevious(props.messageids?.length)
  useEffect(() => {
    if (isEmpty(props.messageids)) return

    if (!prevMessageidsSize && props.messageids?.length || prevChannel !== props.channel) {
      scrollToIndex({ index: 'LAST', align: 'end' })
    }

  }, [props.messageids?.length, prevMessageidsSize, props.channel, prevChannel])

  useEffect(() => { pickingEmoji && closeGif() }, [pickingEmoji])
  useEffect(() => { pickingGif && closeEmoji() }, [pickingGif])

  const closeEmoji = useCallback(() => setPickingEmoji(false), [])
  const appendEmoji = useCallback((emojiData) => {
    const input = document.getElementById('chat-message-input')
    if (isEmpty(input) || isEmpty(emojiData)) return

    input.appendText(emojiData.emoji)
  }, [])

  const closeGif = useCallback(() => setPickingGif(false), [])
  const appendGif = useCallback((gifData) => {
    if (isEmpty(gifData)) return

    if (!isEmpty(props.psig)) {
      closeGif()
      props.CHAT_SEND({
        content: gifToWord(gifData),
        sender: props.sender,
        nickname: props.nickname,
        channel: props.channel,
        type: GENERIC_MSG,
        psig: props.psig,
        cts: nowUnixTS(),
      })
    }

  }, [
    props.psig,
    props.sender,
    props.nickname,
    props.channel,
  ])

  useEffect(() => {
    const _input = textInput.current
    if (!isEmpty(_input)) {
      _input.autoresize = () => autoresize({ target: _input })
      _input.autoresize()

      _input.autonormalize = () => {
        const maxLength = _input.getAttribute('maxLength')
        if (_input.value.length > maxLength) {
          _input.value = _input.value.substring(0, maxLength)
          _input.autoresize()
        }
      }
      _input.autonormalize()

      _input.setValue = (value) => {
        const setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set
        setter.call(_input, value)
        const e = new Event('input', { bubbles: true, cancelable: false })
        _input.dispatchEvent(e)
      }

      _input.appendText = (text) => {

        const newvalue = _input.value ? _input.value + ' ' + text : text
        const descriptor = Object.getOwnPropertyDescriptor(_input, 'value')

        if (descriptor && descriptor.configurable) delete _input.value

        _input.setValue(newvalue)

        if (descriptor) {
          Object.defineProperty(_input, 'value', descriptor)
        }

        _input.focus && _input.focus()
        _input.autoresize && _input.autoresize()
        _input.autonormalize && _input.autonormalize()

      }

      _input.autoclose = () => {
        closeEmoji()
        closeGif()
      }
    }
  }, [
    textInput.current
  ])

  useScheduledCommand((command, state) => {

    const isConnected = isChatConnected(state)
    const sender = getActiveAccountAddress(state)
    const nickname = getActiveAccountNickname(state)
    const psig = getActiveAuthPersonalSignature(state)
    const channels = getSubscribedChatChannels(state, sender)

    if (isConnected && !isEmpty(sender) && !isEmpty(psig) && !isEmpty(channels)) {

      command(CHAT_SEND, {
        sender,
        nickname,
        channel: channels,
        type: PING_MSG,
        cts: nowUnixTS(),
        psig,
      }, { schedule: config.chat_ping_period })

    }

  }, [])

  const handleFocus = useCallback(() => setInputFocused(true), [])
  const handleBlur = useCallback(() => setInputFocused(false), [])

  const handleAtTopStateChange = useCallback((atTop) => { setHeaderCollapsed(!atTop) }, [])

  return (
    <div className={css.chatwidget}>

      <ChatHeader collapsed={headerCollapsed} />

      <div className={css.messages}>
        <div className={css.inner}>

        {!isEmpty(props.messageids) &&
          <Virtuoso
            ref={virtuosoRef}
            followOutput={virtuoso.followOutput}
            components={virtuoso.components}
            itemContent={virtuoso.itemContent}
            atTopThreshold={virtuoso.atTopThreshold}
            computeItemKey={virtuoso.computeItemKey}
            alignToBottom={virtuoso.alignToBottom}
            data={props.messageids}
            atTopStateChange={handleAtTopStateChange}
          />
        }

        </div>
      </div>

      {pickingEmoji &&
        <EmojiPicker onClose={closeEmoji} onPicked={appendEmoji} />
      }
      {pickingGif &&
        <GifPicker onClose={closeGif} onPicked={appendGif} />
      }

      <div className={cn(css.form, {
        [css.enabled]: props.isChatReady,
        [css.activate]: isSendButtonActive,
      })}>

        <div className={cn(css.component, { [css.focused]: inputFocused })}>
          <textarea
            id="chat-message-input"
            maxLength={300}
            ref={textInput}
            type="text"
            onInput={autoresize}
            onKeyDown={handleMessageKey}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChange={handleMessageChange}
            placeholder={t('Write a message...')}
          />

          <div className={css.icons}>
            <div
              className={cn(css.icon, css.gif, { [css.picking]: pickingGif })}
              onClick={() => setPickingGif(!pickingGif)}
            >
              <GifIcon />
            </div>
            <div
              className={cn(css.icon, { [css.picking]: pickingEmoji })}
              onClick={() => setPickingEmoji(!pickingEmoji)}
            >
              <EmojiIcon />
            </div>
          </div>
        </div>


        <ButtonProvider className={css.sendbutton} onClick={handleSubmit}>
          <SendButtonIcon />
        </ButtonProvider>

      </div>

    </div>
  )
}

export default connect(
  (state, props) => ({
    sender: getActiveAccountAddress(state),
    nickname: getActiveAccountNickname(state),
    channel: getChatActiveChannel(state),
    isChatConnected: isChatConnected(state),
    isChatReady: isChatReady(state),
    messageids: getChatActiveChannelMessageIds(state),
    psig: getActiveAuthPersonalSignature(state),
  }),
  ({ query, command }) => [
    command(CHAT_SEND),
  ]
)(React.memo(ChatWidget))
