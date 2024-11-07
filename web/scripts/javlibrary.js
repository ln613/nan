import { Url, val, click } from './html.js'
import { wrapRD, trimUrl, rgSize } from './utils.js'

const m = Url.params.m

if (m) {
  val('#idsearchbox', m)
  click('#idsearchbutton')
}

trimUrl('https://www.javlibrary.com/en/redirect.php?url=')

wrapRD()

rgSize()
