import { HOST } from "./utils.js"

const scripts = ['5050', 'eztv', 'javdb', 'javlibrary', 'kuaishou', 'music.apple', 'real-debrid', 'visualstudio', 'xsnvshen', 'youtube']

const cfgs = {
  js: { tag: 'script', src: 'src', type: ['type', 'text/javascript'] },
  mjs: { tag: 'script', src: 'src', type: ['type', 'module'] },
  css: { tag: 'link', src: 'href', type: ['rel', 'stylesheet'] },
}

const load = (src, isModule) =>
  new Promise((resolve, reject) => {
    const l = src.lastIndexOf('.')
    const cfg = cfgs[src.slice(l + 1)]
    const tag = document.createElement(cfg.tag)
    const container = document.head || document.body
    tag[cfg.type[0]] = isModule ? 'module' : cfg.type[1]
    tag.async = true
    tag[cfg.src] = src.startsWith('https') ? src : `${HOST}${src}`
    tag.addEventListener('load', resolve)
    container.appendChild(tag)
  })

const loadAll = async () => {
  load('out.css')
  await load('https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.21/lodash.min.js')
  // const loadReact = async () => {
  //   await load('https://unpkg.com/react@18/umd/react.REACT_ENV.js')
  //   await load('https://unpkg.com/react-dom@18/umd/react-dom.REACT_ENV.js')
  // }
  // await Promise.all([
  //   loadReact(),
  // ])
  const script = scripts.find(s => window.location.host.includes(s))
  script && load(`scripts/${script}.js`, true)
}

loadAll()
