import { key, $1, $3, Url, waitFor } from '@sace/core'
import { tap, dbInit, get, NF, LH, trimLeft, trimRight, waitUntil } from './utils'

const getUser = () => {
  let u = $1('.user-detail .user-name').innerText.replace(
    /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g,
    ''
  )
  return trimRight(u, '.').trim()
}

const cck = 'clientCacheKey='
const upic = '/upic/'
const db = dbInit('pcn.ai', ['ks'])
const id = trimLeft(Url.pathname, '/profile/')
const user = getUser()
const folder = `c:\\t\\ks\\${user}`
let saved

const init = async () => {
  // const saved = await db.ks.search({ id })
  // const videos = saved.length > 0 ? saved[0].videos : []

  key('^Enter', async () => {
    await getSaved()
    dl(0)
  })
  key('q', () => info())

  await waitUntil(
    () => $1('.spinning .text')?.innerText === '已经到底了，没有更多内容了'
  )
  info()
}

init()

const getCards = () => $3('.card-link')

const getSaved = async () => {
  if (!saved) saved = await get(`${NF}web?type=folder&folder=${folder}`)
}

const parseCard = card => {
  const src = $1('.poster-img', card).src
  const vid = src.slice(src.indexOf(cck) + cck.length, src.lastIndexOf('.jpg'))
  const s1 = src.indexOf(upic) + upic.length
  const date = src.slice(s1, s1 + 13).replace(/\//g, '.')
  return `${date} - ${vid}.mp4`
}

const info = async () => {
  await getSaved()
  const fns = getCards()
    .map(parseCard)
    .filter(x => !x.includes('placeholder'))
  const l = _.difference(fns, saved)
  const txt = `${fns.length}/${saved.length}/${tap(l).length}`
  $1('.user-detail-item p').innerText = txt
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
    $1('.close-page').click()
    // await db.ks.save({ id, user, videos: ids })
  }
  if (n < cards.length - 1) setTimeout(() => dl(n + 1), isDL ? 100 : 0)
}
