import { $3 } from './html.js'

setInterval(() => {
  $3('.attachments-grid-file-name a').forEach(a => {
    const l = a.href.indexOf('&download')
    if (l) a.href = a.href.slice(0, l)
  })
}, 100)
