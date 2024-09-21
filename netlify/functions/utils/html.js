import fetch from 'node-fetch'
import { load } from 'cheerio'
import { difference, differenceBy, flatten, union, unionBy } from 'lodash'
import puppeteer from 'puppeteer'
import { trimLeft } from './string'
import { search, save, get } from '.'
// import _download from 'download'
import fs from 'fs'

const getArray = ($, selector) => {
  let [s, a] = selector.split('@')
  if (!s) return []
  if (!a) a = 'innerText'
  return $(s)
    .map((i, x) => $(x).prop(a))
    .get()
}

const getObjs = ($, root, selectors) => {
  const r = $(root)
  const ss = selectors.split(',').map(selector => {
    let [s, a, n] = selector.split('@')
    if (!a) a = 'innerText'
    if (!n) n = trimLeft(trimLeft(s || a, '.'), '#')
    const es = s ? r.find(s) : r
    const vs = es.map((i, x) => $(x).prop(a)).get()
    return [n, vs]
  })
  return ss[0][1].map((x, i) =>
    Object.fromEntries(ss.map(a => [a[0], a[1][i]]))
  )
}

// selectors - 1. selector@attr, 2. root!selector1@attr1@name1,selector2@attr2@name2
export const getArrayHtml = (html, selectors) => {
  const $ = load(html)
  const l = selectors.indexOf('!')
  if (l > 0) {
    const roots = $(selectors.slice(0, l))
    return flatten(roots.map((i, r) => getObjs($, r, selectors.slice(l + 1))))
  } else {
    return getArray($, selectors)
  }
}

export const getArrayUrl = async (url, selectors) => {
  const html = await fetch(url).then(r => r.text())
  return getArrayHtml(html, selectors)
}

export const getNewItemsInPage = async ({
  url,
  id,
  db,
  doc,
  selector,
  attr,
  mapping,
  by,
  path = 'items',
}) => {
  const saved = await search({ id, db, doc, path })
  let all = await getAllItemsInPage(url, selector, attr)
  if (mapping) all = all.map(eval(mapping))
  return by ? differenceBy(all, saved, by) : difference(all, saved)
}

const getAllItemsInPage = async (url, selector, attr = 'innerText') => {
  try {
    const browser = await puppeteer.launch({ headless: 'new' })
    const page = await browser.newPage()
    await page.goto(url)
    const data = await page.evaluate(
      () => document.querySelector('*').outerHTML
    )
    console.log(data)
    await scrollToBottom(page, selector)
    const items = await page.$$eval(selector, links => links.map(x => x.href))
    await browser.close()
    return items
  } catch (e) {
    console.log(e)
    return []
  }
}

const scrollToBottom = async (page, selector) => {
  let y = await page.evaluate(() => window.scrollY)
  let y1 = 0
  await page.waitForTimeout(100)
  while (true) {
    await page.evaluate(selector => {
      const es = document.querySelectorAll(selector)
      console.log(es)
      es[es.length - 1].scrollIntoView()
    }, selector)
    await page.waitForTimeout(100)
    y1 = await page.evaluate(() => window.scrollY)
    if (y === y1) break
    y = y1
  }
}

// export const youtubeDownloadUrl = async url => {
//   if (!url.startsWith('http')) url = `http://www.youtube.com/watch?v=${url}`
//   const r = await getArrayUrl(
//     `https://10downloader.com/download?v=${url}`,
//     '.downloadsTable tr td:first-child, .downloadsTable tr td:nth-child(2), .downloadsTable tr td a@href, .info .title'
//   )
//   const i = findIndex(
//     zip(r[0], r[1], (x, y) => x + y),
//     ['2160pwebm', '2160pmp4', '1080pwebm', '1080pmp4', '720pwebm', '720pmp4']
//   )
//   return i > -1 ? [trimFrom(r[2][i], '&title='), r[3][0], r[1][i]] : ''
// }

export const saveItemsInPage = async ({
  id,
  db,
  doc,
  by,
  items,
  path = 'items',
}) => {
  const saved = await search({ id, db, doc, path })
  const all = by ? unionBy(saved, items, by) : union(saved, items)
  await save({ db, doc, obj: { id, [path]: all } })
}

// export const download = ({ url, filename, folder }) => {
//   if (!url.startsWith('blob:') && !fs.existsSync(`${folder}\\${filename}`)) {
//     try {
//       _download(url, folder, { filename })
//     } catch {}
//   }
// }

export const folder = dir => {
  try {
    return fs.readdirSync(dir)
  } catch {
    return []
  }
}

export const extractSaved = async (name, def, params) => {
  const docs = await get('doc', 'pcn.extract', 'extract')
  const doc = docs.find(x => x.name === name)
  if (!doc) return ''
  const d = doc.defs.find(x => x.name === def)
  if (!d) return ''
  return getArrayUrl(`${doc.url}/${replace(d.path, params)}`, d.def)
}

const replace = (s, ps) => Object.entries(ps).reduce((p, [k, v]) => p.replace(`{${k}}`, v), s)