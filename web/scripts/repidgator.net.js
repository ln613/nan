import { Url } from './html.js'

if (Url.pathname.startsWith('/file/')) {
  window.location.href = `https://real-debrid.com/downloader?m=${Url.href}`
}
