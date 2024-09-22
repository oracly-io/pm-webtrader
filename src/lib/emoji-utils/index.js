function getEmojis(str) {
  const regex = /\p{RI}\p{RI}|\p{Emoji}(\p{EMod}+|\u{FE0F}\u{20E3}?|[\u{E0020}-\u{E007E}]+\u{E007F})?(\u{200D}\p{Emoji}(\p{EMod}+|\u{FE0F}\u{20E3}?|[\u{E0020}-\u{E007E}]+\u{E007F})?)+|\p{EPres}(\p{EMod}+|\u{FE0F}\u{20E3}?|[\u{E0020}-\u{E007E}]+\u{E007F})?|\p{Emoji}(\p{EMod}+|\u{FE0F}\u{20E3}?|[\u{E0020}-\u{E007E}]+\u{E007F})/gu
  const matches = Array.from(str.matchAll(regex))
  const emojis = matches.map(match => match[0])
  return postProcessEmojis(emojis)
}

function postProcessEmojis(emojis) {
  let _emojis = []
  for (const emoji of emojis) {
    if (emoji === '\u{FE0F}' || emoji === '\u{FE0E}') {
      _emojis[_emojis.length - 1] += emoji
    } else {
      _emojis.push(emoji)
    }
  }
  return _emojis
}

function emojiToWord(emoji) {
  const codePoints = Array.from(emoji).map(
    char => char.codePointAt(0).toString(16).toUpperCase()
  )
  return ':' + codePoints.join('-').toLowerCase() + ':'
}

export function replaceEmojiWithWord(str) {
  for (const emoji of getEmojis(str)) {
    const code = emojiToWord(emoji)
    str = str.replaceAll(emoji, code)
  }
  return str
}

