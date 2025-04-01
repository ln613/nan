import { $1, $3 } from './html.js'
import { wrapLA, rgSize } from './utils.js'

wrapLA()
rgSize()

$1('#content').style.margin = 0
$1('.entry-content').style.zIndex = 10000
$1('.entry-content').style.position = 'relative'
const imgs = $3('.entry-content p img')
const imgsAdded = []
imgs.forEach((x, i) => {
  const src = x.src.replace('-4k.h264', '').replace('-8k.hevc', '').replace('-4k', '').replace('-8k', '')
  if (imgsAdded.includes(src)) {
    x.style.display = 'none'
  } else {
    x.style.maxWidth = 'fit-content' 
    imgsAdded.push(src)
  }
})
