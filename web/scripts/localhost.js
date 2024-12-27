import { key, $1, $3, prependChild, remove, css } from './html.js'
import { sleep, tap } from './utils.js'

const IMGS = ['.jpeg', '.jpg', '.png', '.gif']
const VIDEOS = ['.mp4', '.avi', '.mpg', '.mpeg', '.mkv']
let imgs
let videos
let rows = 3
let idx = 0

if ($1('address')?.innerText.includes('server running @ localhost')) {
  css('body', 'margin', '0px')
  css('body', 'padding', '0px')

  key('Escape', () => {
    if ($1('#full_vi')) {
      remove('#full_vi')
    } else if ($1('.vi')) {
      remove('.vi')
    } else {
      const links = $3('a').filter(x => x.href).map(x => x.href.toLowerCase())
      imgs = links.filter(x => IMGS.some(y => x.endsWith(y)))
      videos = links.filter(x => VIDEOS.some(y => x.endsWith(y)))
      render()
    }
  })

  key('1', () => setRows(1))
  key('2', () => setRows(2))
  key('3', () => setRows(3))
  key('4', () => setRows(4))
  key('q', () => page(-1))
  key('a', () => page(1))
  key('ArrowRight', () => next(1))
  key('ArrowLeft', () => next(-1))
}

const render = () => {
  if ($1('.vi')) remove('.vi')
  if (videos.length > 0) prependVideo()
  if (imgs.length > 0) prependImg()
}

const prependImg = () => prependChild(
  'body',
  `<div class="fw vi">${imgs.map(x => `<img src="${x}" height=${getHeight()} />`).join('')}</div>`
)

const prependVideo = () => {
  prependChild(
    'body',
    `<div class="fw vi">${videos.map((x, i) => `<video src="${x}" height=${getHeight()} loop muted></video>`).join('')}</div>`
  )
  $3('.vi video').forEach((v, i) => {
    v.addEventListener('click', () => full(v.src, i))
    v.addEventListener('mouseover', () => v.play())
    v.addEventListener('mouseout', () => v.pause())
  })
}

const isPlaying = v => v.currentTime > 0 && !v.paused && !v.ended && v.readyState > 2

const getHeight = () => window.innerHeight / rows

const setRows = r => {
  rows = r
  render()
}

const page = n => window.scrollTo(0, window.scrollY + n * window.innerHeight)

const full = (x, i) => {
  idx = i
  prependChild(
    'body',
    `<div id="full_vi" class="pf Gray"><video src="${x}" width=${window.innerWidth} height=${window.innerHeight} autoplay loop muted></video></div>`
  )
}

const next = n => {
  const v = $1('#full_vi video')
  if (v) {
    idx += n
    if (idx < 0) idx = 0
    else if (idx == videos.length) idx = videos.length - 1
    else v.src = videos[idx]
  }
}