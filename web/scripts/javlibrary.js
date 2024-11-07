import { Url, value, click } from './html.js'
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
  trimUrl('https://www.javlibrary.com/en/redirect.php?url=')
  wrapRD()
  rgSize()
}
