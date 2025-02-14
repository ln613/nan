import { $1, css, append, remove, text, value, click, Url, waitFor } from './html.js'

const m = Url.params.m

const run = async () => {
  if (Url.pathname === '/downloader') {
    if (m) {
      const t = '#urllist'
      await waitFor(t)
      $1(t).focus()
      text(t, m)
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
}

run()