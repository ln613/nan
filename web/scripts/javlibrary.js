import { Url, value, click, $1, $3 } from './html.js'
import { wrapRD, trimUrl, rgSize } from './utils.js'

const m = Url.params.m

if (m) {
  value('#idsearchbox', m)
  click('#idsearchbutton')
}

const all = $1('#video_comments_all a')

if (all) {
  click(all)
} else {
  $3('.showalltext').forEach(click)
  trimUrl('https://www.javlibrary.com/en/redirect.php?url=')
  wrapRD()
  rgSize()
}
