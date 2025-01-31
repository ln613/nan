import { $1, css, append, remove, text, value, click, Url } from './html.js'

const m = Url.params.m

if (Url.pathname === '/downloader') {
  if (m) {
    $1('#urllist').focus()
    text('#urllist', m)
    $1('#password').focus()
    setTimeout(() => click('.btn.mr-2.btn-gradient-primary'), 1000)
    const iid = setInterval(() => {
      if ($1('.card.bg-primary')) {
        clearInterval(iid)
        window.location.href = $1('.card.bg-primary a').href
        //setTimeout(window.close, 2000)
      }
    }, 100)
  }
}