import { key, $1, $3, prependChild } from './html.js'
import { sleep, tap } from './utils.js'

const IMGS = ['.jpeg', '.jpg', '.png', '.gif']
const VIDEOS = ['.jpeg', '.jpg', '.png', '.gif']

if ($1('address')?.innerText.includes('server running @ localhost')) {

  key('^Enter', async () => {
    const links = $3('a').filter(x => x.href).map(x => x.href.toLowerCase())
    const imgs = links.filter(x => IMGS.some(y => x.endsWith(y)))
    const videos = links.filter(x => VIDEOS.some(y => x.endsWith(y)))
    
    prependChild(
      'body',
      `<div class="fw">${imgs.map(x => `<img src="${x}" height=300 />`)}</div>`
    )
  })
}
