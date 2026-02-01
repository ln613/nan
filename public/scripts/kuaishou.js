import { key, $1, $3, Url, waitFor } from './html.js'
import { tap, dbInit, get, NF, LH, trimLeft, trimRight, waitUntil } from './utils.js'

const getUser = () => {
  let u = $1('.user-info .user .name')?.innerText?.replace(
    /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g,
    ''
  )
  return tap(trimRight(u, '.').trim())
}

const cck = 'clientCacheKey='
const upic = '/upic/'
const db = dbInit('pcn.ai', ['ks'])
const id = trimLeft(Url.pathname, '/profile/')
let user
let folder
let saved

const init = async () => {
  // const saved = await db.ks.search({ id })
  // const videos = saved.length > 0 ? saved[0].videos : []

  key('^Enter', async () => {
    user = getUser()
    if (!user) {
      alert('no user found')
    } else {
      folder = `c:\\t\\ks\\${user}`
      await getSaved()
      dl(0)
    }
  })
  key('q', () => info())

  await waitUntil(
    () => $1('.spinning .text')?.innerText === '已经到底了，没有更多内容了'
  )
  //info()
}

init()

const getCards = () => $3('.photo-card')

const getSaved = async () => {
  saved = await get(`${NF}web?type=folder&folder=${folder}`)
}

const parseCard = card => {
  const src = $1('.cover-img', card).src
  const vid = src.slice(src.indexOf(cck) + cck.length, src.lastIndexOf('.jpg'))
  const s1 = src.indexOf(upic) + upic.length
  const date = src.slice(s1, s1 + 13).replace(/\//g, '.')
  return `${date} - ${vid}.mp4`
}

const info = async () => {
  user = getUser()
  if (!user) {
    alert('no user found')
  } else {
    folder = `c:\\t\\ks\\${user}`
    await getSaved()
    const fns = getCards()
      .map(parseCard)
      .filter(x => !x.includes('placeholder'))
    const l = _.difference(fns, saved)
    const txt = `${fns.length}/${saved.length}/${tap(l).length}`
    alert(txt)
  }
}

const dl = async n => {
  const cards = getCards()
  const card = cards[n]
  const filename = parseCard(card)
  const isDL =
    !filename.includes('placeholder') && (!saved || !saved.includes(filename))
  if (isDL) {
    console.log('DL', filename)
    card.click()
    const v = await waitFor('video')
    get(
      `${LH}download/${encodeURIComponent(v.src)}/${encodeURIComponent(
        filename
      )}/${encodeURIComponent(folder)}`
    )
    $1('.close.circle-btn').click()
    // await db.ks.save({ id, user, videos: ids })
  }
  if (n < cards.length - 1) setTimeout(() => dl(n + 1), isDL ? 100 : 0)
}
