import { isEmpty, isBoolean, trim } from 'lodash'
import { subgraphKeccak256 } from '@oracly/pm-libs/hash-utils'

import config from '@config'

import { SUBSCRIBE_MSG, UNSUBSCRIBE_MSG } from '@constants'

const USERNAME_CHAR = '@'
const EMOJI_CHAR = ':'
const GIF_CHAR = '>'

const USERNAME_REGEX = USERNAME_CHAR + '0x[a-f0-9]{40}'
const EMOJI_CODE_REGEX = EMOJI_CHAR + '[a-z0-9_-]{4,}' + EMOJI_CHAR
const GIF_CODE_REGEX = GIF_CHAR + '[^'+GIF_CHAR+'\\s]{10,}' + GIF_CHAR
const SPACE_REGEX = '\\s+'

export function toMessageId({ sender, content, channel, type, cts }) {
  return subgraphKeccak256({ sender, content, channel, type, cts })
}

export function toContent(word) {
  if (isRegular(word)) return word
  if (isUsername(word)) return trim(word, USERNAME_CHAR)
  if (isEmoji(word)) return trim(word, EMOJI_CHAR)
  if (isGif(word)) return config.gif_host + trim(word, GIF_CHAR)
  if (isSpace(word)) return ' '
}

export function isRegular(word) {

  const specific = isSpecific(word)

  return isBoolean(specific) && !specific && word

}

export function isSpecific(word) {
  return (
    isSpace(word) ||
    isUsername(word) ||
    isEmoji(word) ||
    isGif(word)
  )
}

export function gifToWord(gif) {
  if (isEmpty(gif) || isEmpty(gif.url)) return ''

  try {

    const url = new URL(gif.url)
    if (url.pathname) {
      return GIF_CHAR + url.pathname + GIF_CHAR
    }

  } catch (e) {
    return ''
  }

}

export function isSpace(word) {
  return new RegExp('^' + SPACE_REGEX + '$').test(word)
}

export function isEmoji(word) {
  return new RegExp('^' + EMOJI_CODE_REGEX + '$', 'i').test(word)
}

export function isGif(word) {
  return new RegExp('^' + GIF_CODE_REGEX + '$', 'i').test(word)
}

export function isUsername(word) {
  return new RegExp('^' + USERNAME_REGEX + '$', 'i').test(word)
}

export function isSystem(message) {
  if (isEmpty(message)) return false
  if (isEmpty(message.type)) return false

  return message.type in { [UNSUBSCRIBE_MSG]:UNSUBSCRIBE_MSG, [SUBSCRIBE_MSG]:SUBSCRIBE_MSG }
}

export function createMessage(message) {
  if (isEmpty(message)) return message

  const { sender, content, channel, psig, type, cts } = message

  return {
    sender,
    content,
    channel,
    psig,
    type,
    cts,
    phantom: true,
    words: tokenize(content),
    messageid: toMessageId({
      sender,
      content,
      channel,
      type,
      cts,
    })
  }
}

function isChar(char, pattern) {
  if (!char || !char[0]) return false
  char = char[0]

  return new RegExp(pattern).test(char)
}

export function tokenize(str) {

  const tokens = tokenizeDeep(str)
  const result = []

  let token
  let prev
  while ((token = tokens.shift())) {
    if (isSpace(token)) token = toContent(token)

    if (
      (isRegular(token) || isSpace(token)) &&
      (isRegular(prev) || isSpace(prev))
    ) {

      result[result.length - 1] += token

    } else {

      result.push(token)

    }

    prev = result[result.length - 1]

  }

  return result

}

function tokenizeDeep(str) {
  str = (str || '').trim()

  let pos = 0
  const tokens = []

  while (pos < str.length) {
    const char = str[pos]
    let nextPos = pos + 1

    // Match space
    if (isChar(char, SPACE_REGEX)) {

      while (isChar(str[nextPos], SPACE_REGEX)) nextPos++
      const token = str.slice(pos, nextPos)
      tokens.push(token)
    }

    // Match username
    else if (isChar(char, USERNAME_CHAR) && new RegExp('^' + USERNAME_REGEX, 'i').test(str.slice(pos))) {

      nextPos = pos + 43 // '@' + '0x' + 40 hex chars + 1 (to include last symbol)
      const token = str.slice(pos, nextPos)
      if (new RegExp('^' + USERNAME_REGEX + '$', 'i').test(token)) {
        tokens.push(token)
      } else {
        tokens.push(char)
        nextPos = pos + 1
      }

    }

    // Match emoji code
    else if (isChar(char, EMOJI_CHAR) && !!~str.indexOf(EMOJI_CHAR, pos + 1)) {
      nextPos = str.indexOf(EMOJI_CHAR, pos + 1) + 1

      const token = str.slice(pos, nextPos)
      if (new RegExp('^' + EMOJI_CODE_REGEX + '$', 'i').test(token)) {
        tokens.push(token)
      } else {
        tokens.push(char)
        nextPos = pos + 1
      }
    }

    // Match gif code
    else if (isChar(char, GIF_CHAR) && !!~str.indexOf(GIF_CHAR, pos + 1)) {
      nextPos = str.indexOf(GIF_CHAR, pos + 1) + 1

      const token = str.slice(pos, nextPos)
      if (new RegExp('^' + GIF_CODE_REGEX + '$', 'i').test(token)) {
        tokens.push(token)
      } else {
        tokens.push(char)
        nextPos = pos + 1
      }
    }

    // Generic token
    else {
      while (
        !(
          isChar(str[nextPos], SPACE_REGEX) ||
          isChar(str[nextPos], EMOJI_CHAR) ||
          isChar(str[nextPos], GIF_CHAR) ||
          isChar(str[nextPos], USERNAME_CHAR)
        ) &&
        nextPos < str.length
      ) {
        nextPos++
      }

      const token = str.slice(pos, nextPos)
      tokens.push(token)
    }

    pos = nextPos
  }

  return tokens
}

