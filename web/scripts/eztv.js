import { $2, remove } from './html.js'

setInterval(() => {
  remove('body>:is(iframe, a)')
  $2('a.magnet').forEach(a => {
    if (a.href.startsWith('magnet:'))
      a.href = `https://real-debrid.com/torrents?m=${a.href}`
  })
}, 100)
