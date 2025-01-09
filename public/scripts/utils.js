// import { createRoot } from 'react-dom/client'
import { createElement, $3 } from './html.js'

// export const isSolid = process.env.fw === 'solid'
// export const isReact = process.env.fw === 'react'
export const isDev = false // process.env.NODE_ENV === 'development'

export const LH = 'http://localhost:690/api/'
export const HOST = // isDev
  // 'http://localhost:704/'
  // 'http://localhost:8081/'
  'https://nan-li.netlify.app/'
export const NF = `${HOST}.netlify/functions/`

export const extract = (url, selectors) =>
  get(`${NF}web?type=extractUrl&url=${url}&selectors=${selectors}`)
export const extractHTML = (html, selectors) =>
  post(`${NF}web?type=extractHtml`, { html, selectors })

export const get = url => fetch(url).then(r => r.json())

export const post = (url, data) =>
  fetch(url, { method: 'post', body: JSON.stringify(data) }).then(r => r.json())

export const DB = (db, doc, type, params) =>
  `${NF}api?type=${type}&doc=${doc}&db=${db}${
    params ? Object.entries(params).map(([k, v]) => `&${k}=${v}`) : ''
  }`

export const sleep = n => new Promise(r => setTimeout(r, n))

export const tap = x => {
  console.log(x)
  return x
}

export const isNum = x => typeof x === 'number'
export const isStr = x => typeof x === 'string'
export const isObj = x => typeof x === 'object'
export const isFunc = x => typeof x === 'function'
export const assert = x => {
  if (!x) throw new Error('assertion failed')
}

export const waitUntil = cond =>
  new Promise(async (res, rej) => {
    while (true) {
      if (cond()) return res(true)
      await sleep(100)
    }
  })

export const mapValue = (o, f) => {
  const es = Object.entries(o).map(
    ([k, v], i) => [k, f(v, k, i)]
  )
  return Object.fromEntries(es)
}
  
export const pad0 = (n, d) => {
  const ad = Math.abs(d)
  const nl = n.toString().length
  if (ad <= nl) return n
  const pad = [...new Array(ad - nl)].map(x => '0').join('')
  return d > 0 ? n + pad : pad + n
}

export const trimFrom = (s, f) => s.slice(0, s.indexOf(f))

export const trimLeft = (s, l) => {
  while (s.startsWith(l)) {
    s = s.slice(l.length)
  }
  return s
}

export const trimRight = (s, l) => {
  while (s.endsWith(l)) {
    s = s.slice(0, -l.length)
  }
  return s
}
  
export const dbInit = (db, docs) =>
  Object.fromEntries(
    docs.map(d => [
      d,
      {
        all: () => get(DB(db, d, 'doc')),
        flat: agg => get(DB(db, d, 'flat', { agg: encodeURIComponent(agg) })),
        getById: id => get(DB(db, d, 'getById', { id: id.toString() })),
        search: params => {
          const ps = mapValue(params, v => v.toString())
          return get(DB(db, d, 'doc', ps))
        },
        save: (data, id = 'id') => post(DB(db, d, 'save', { id }), data),
      },
    ])
  )

const $3a = () => $3('a')

export const wrapUrl =
  (sites, wrapper) => () =>
    setTimeout(() => {
      $3a().forEach(a =>
        sites
          .filter(s => a.href.includes(s))
          .forEach(s => (a.href = a.href.replace('https://' + s, wrapper(s))))
      )
    }, 1000)

export const wrapRD = wrapUrl(
  ['rapidgator.net', 'rg.to', 'uploaded.net', 'ul.to'],
  s => `https://real-debrid.com/downloader?m=https://${s}`
)

export const rgSize = () => {
  setTimeout(() => {
    $3a()
      .filter(a => a.href.includes('rapidgator.net'))
      .forEach(a => {
        const l = a.href.indexOf('rapidgator.net') - 8
        extract(a.href.slice(l), '.file-descr div > strong').then(
          r => (a.innerText = `${a.innerText} - ${r}`)
        )
      })
  }, 1000)
}

export const trimUrl = t =>
  setTimeout(() => {
    $3a().forEach(a => (a.href = decodeURIComponent(a.href).replace(t, '')))
  }, 1000)

// export const render = (jsx, id) => {
//   createElement('div', { id })
//   const fui = document.getElementById(id)
//   if (fui) {
//     const root = createRoot(fui)
//     root.render(jsx)
//   }
// }
