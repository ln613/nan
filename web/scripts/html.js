import { sleep, isStr } from './utils.js'

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition

let speechRecognition

export const $1 = (s, d) =>
  isStr(s) ? (d || document).querySelector(s) : s
export const $2 = (s, d) =>
  isStr(s) ? (d || document).querySelectorAll(s) : s
export const $3 = (s, d) =>
  isStr(s) ? Array.from((d || document).querySelectorAll(s)) : s
export const children = s => Array.from($1(s)?.children || [])

export let Url

export const parseUrl = () => {
  if (!window.location) return null
  Url = new URL(window.location.href)
  Url.params = Object.fromEntries(Url.searchParams)
  return Url
}

export const parse = html => {
  const d = document.createElement('html')
  d.innerHTML = html
  return d
}

export const css = (s, p, v) => {
  var e = $1(s)
  if (e) {
    if (v) e.style.setProperty(p, v)
    else return e.style.getPropertyValue(p)
  }
}

export const attr = (s, p, v) => {
  var e = $1(s)
  if (e) {
    if (v) e.setAttribute(p, v)
    else return e.getAttribute(p)
  }
}

export const addStyle = s => {
  const style = document.createElement('style')
  style.appendChild(document.createTextNode(s))
  document.head.appendChild(style)
}

export const createElement = (t, a) => {
  const e = document.createElement(t)
  Object.entries(a).forEach(([k, v]) => e.setAttribute(k, v))
  document.body.appendChild(e)
}

export const remove = s => {
  $2(s).forEach(x => x.remove())
}

const insert = (s, p, v) => {
  if (v[0] === '<') {
    $1(s)?.insertAdjacentHTML(p, v)
  } else {
    const e = $1(v)
    if (e) $1(s)?.insertAdjacentElement(p, e)
  }
}

export const prepend = (s, v) => {
  insert(s, 'beforebegin', v)
}
export const prependChild = (s, v) => {
  insert(s, 'afterbegin', v)
}

export const appendChild = (s, v) => {
  insert(s, 'beforeend', v)
}

export const append = (s, v) => {
  insert(s, 'afterend', v)
}

export const text = (s, t) => {
  const e = $1(s)
  if (e) e.innerText = t
}

export const value = (s, t) => {
  const e = $1(s)
  if (e instanceof HTMLInputElement || e instanceof HTMLSelectElement) e.value = t
}

export const options = (s, opts) => {
  const e = $1(s)
  if (e instanceof HTMLSelectElement) {
    opts = opts.map(o => isStr(o) ? [o, o] : o)
    e.innerHTML = opts.map(o => `<option value="${o[0]}">${o[1]}</option>`).join('')
  }
}

export const click = s => {
  $1(s)?.click()
}

const isInput = e =>
  (e.target &&
    ['input', 'textarea'].includes(
      (e.target.tagName || '').toLowerCase()
    )) ||
  window.location.href.includes('outlook.live.com')

const isMetaKey = (ck, e) =>
  (!ck && !e.ctrlKey && !e.shiftKey && !e.altKey) ||
  (ck === '^' && e.ctrlKey) ||
  (ck === '+' && e.shiftKey) ||
  (ck === '!' && e.altKey)

const isKeyInRange = (k, s, n) =>
  k.length === 1 &&
  [...new Array(n)].map((_, i) => i + s).includes(k.charCodeAt(0))
const isAlphaKey = k => isKeyInRange(k, 97, 26)
const isDigitKey = k => isKeyInRange(k, 48, 10)

export const key = (k, f) => {
  k = k.toLowerCase()
  let ck = ''
  if (['^', '+', '!'].includes(k[0])) {
    ck = k[0]
    k = k.slice(1)
  }
  let match = e => e === k
  if (k === '_d') match = isDigitKey
  if (k === '_a') match = isAlphaKey
  if (k === '_w') match = k => isAlphaKey(k) || isDigitKey(k)

  const eh = e => {
    const ek = e.key.toLowerCase()
    if (match(ek) && isMetaKey(ck, e) && !isInput(e))
      f(e.target, ek)
  }
  document.addEventListener('keydown', eh)
  return () => document.removeEventListener('keydown', eh)
}

export const onclick = (s, f) => {
  $1(s)?.addEventListener('click', e => f(e))
}

export const onchange = (s, f) => {
  $1(s)?.addEventListener('change', e => f(e))
}

const enterFullscreen = () => {
  document.documentElement.requestFullscreen()
  document.documentElement.style.scrollbarWidth = 'none'
  document.body.style.cursor = 'none'
}

const exitFullscreen = () => {
  document.exitFullscreen()
  document.documentElement.style.scrollbarWidth = 'thin'
  document.body.style.cursor = 'pointer'
}

export const fullscreen = n => {
  const isFS = document.fullscreenElement
  if (n === 1) {
    !isFS && enterFullscreen()
  } else if (n === 2) {
    isFS && exitFullscreen()
  } else {
    isFS ? exitFullscreen() : enterFullscreen()
  }
}

export const onfullscreen = f => {
  const eh = () => f(!!document.fullscreenElement)
  document.addEventListener('fullscreenchange', eh)
  return () => {
    console.log('remove fs')
    document.removeEventListener('fullscreenchange', eh)
  }
}

export const inView = f =>
  new window.IntersectionObserver(([entry]) => f(entry.isIntersecting))

export const download = (url, file) => {
  const e = document.createElement('a')
  e.setAttribute('href', url)
  file && e.setAttribute('download', file)
  e.style.display = 'none'
  console.log(e)
  document.body.appendChild(e)
  e.click()
  document.body.removeChild(e)
}

export const waitFor = async s => {
  while (true) {
    const t = isStr(s) ? $1(s) : s
    if (t) return t
    await sleep(100)
  }
}

export const speak = (txt, lang = 'en-US') => {
  if (speechSynthesis) {
    const voice = speechSynthesis.getVoices().find(v => v.lang === lang)
    if (voice) {
      console.log(`${voice.name} - ${voice.lang}`)
      const u = new SpeechSynthesisUtterance(txt)
      u.voice = voice
      u.onerror = e => console.log(e.error)
      speechSynthesis.speak(u)
    }
  }
}

export const listen = (lang, result) => {
  if (!speechRecognition) {
    speechRecognition = SpeechRecognition && new SpeechRecognition()
  }
  if (speechRecognition) {
    speechRecognition.continuous = true
    speechRecognition.lang = lang
    speechRecognition.onresult = e => {
      result(e.results[e.resultIndex][0].transcript)
    }
    speechRecognition.start()
  }
}

export const stopListen = () => {
  if (speechRecognition) {
    speechRecognition.stop()
  }
}

const init = () => {
  parseUrl()
  key('`', () => fullscreen())
}

typeof window === 'object' && window.document && init()
