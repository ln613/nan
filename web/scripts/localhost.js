import { key, $1, $3, prependChild, remove } from './html.js'
import { sleep, tap } from './utils.js'

const IMGS = ['.jpeg', '.jpg', '.png', '.gif']
const VIDEOS = ['.mp4', '.avi', '.mpg', '.mpeg', '.mkv']
let imgs
let videos

if ($1('address')?.innerText.includes('server running @ localhost')) {

  key('Escape', async () => {
    if ($1('.vi')) {
      remove('.vi')
    } else {
      const links = $3('a').filter(x => x.href).map(x => x.href.toLowerCase())
      imgs = links.filter(x => IMGS.some(y => x.endsWith(y)))
      videos = links.filter(x => VIDEOS.some(y => x.endsWith(y)))
      if (videos.length > 0) prependVideo()
      if (imgs.length > 0) prependImg()
    }
  })
}

const prependImg = () => prependChild(
  'body',
  `<div class="fw vi">${imgs.map(x => `<img src="${x}" height=300 />`).join('')}</div>`
)

const prependVideo = () => {
  prependChild(
    'body',
    `<div class="fw vi">${videos.map((x, i) => `<video src="${x}" height=300 loop muted></video>`).join('')}</div>`
  )
  $3('.vi video').forEach(v => v.addEventListener('click', () => isPlaying(v) ? v.pause() : v.play()))
}

const isPlaying = v => v.currentTime > 0 && !v.paused && !v.ended && v.readyState > 2;
