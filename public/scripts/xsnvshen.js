import ImgList from '../components/imglist'
import { save, getById, $1, $3, Url, key } from './html.js'

const db = 'pcn.pcn'
const doc = 'lnnlgmail_rank'
let id
let rank

ImgList({
  src: $3('.showlists.hide ul li img').map(x =>
    x.getAttribute('data-original').replace(/thumb_600x900\//, '')
  ),
  file: Url.pathname.match(/\/album\/\d+\//) ? '1' : '',
  cols: 0,
})

const saveAlbum = async () => {
  const mid = $1('.lm_name a').href.split('/').slice(-1)[0]
  const name = $1('.lm_name a').innerText
  const newRank = prompt('rank?', rank)
  if (newRank && !isNaN(+newRank)) {
    await save(db, doc, { id: +id, mid: +mid, name, rank: +newRank })
    alert('saved')
    rank = newRank
  }
}

const init = async () => {
  key('^z', saveAlbum)
  const p = Url.pathname.endsWith('/')
    ? Url.pathname.slice(0, -1)
    : Url.pathname
  id = p.split('/').slice(-1)[0]
  const o = await getById(db, doc, id)
  rank = o && o.rank
}

init()
