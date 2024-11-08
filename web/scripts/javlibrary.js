import { Url, value, click, $1, $3 } from './html.js'
import { wrapRD, trimUrl, rgSize } from './utils.js'

const sorts = ['https://pics.dmm.co.jp', 'Reducing_Mosaic', 'Mosaic_reduce', 'rapidgator.net']

const m = Url.params.m

if (m) {
  value('#idsearchbox', m)
  click('#idsearchbutton')
}

const order = x => {
  const i = sorts.findIndex(y => x.innerText.includes(y))
  return i == -1 ? 100 : i
}

const all = $1('#video_comments_all a')

if (all) {
  click(all)
} else {
  $3('.showalltext').forEach(click)
  $1('#video_comments').innerHTML = _.sortBy($3('table.comment'), [order]).map(x => x.outerHTML).join('')
  trimUrl('https://www.javlibrary.com/en/redirect.php?url=')
  wrapRD()
  rgSize()
}

