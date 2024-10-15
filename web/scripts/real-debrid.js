import { $2, css, append, remove, text, value, click, Url } from './html'

remove('.icone_down')
remove('.liste_arrow')
css('#links', 'height', '50px')
append('#navigation', '#aside1_v1')

const m = Url.params.m

if (Url.pathname === '/downloader') {
  if (m) {
    text('#links', m)
    append(
      '#links',
      `<a href="${m}" onclick="navigator.clipboard.writeText('${m}')">${m}</a>`
    )
    click('#sub_links')
  }
  const iid = setInterval(() => {
    if ($2('#l1 a').length > 0) {
      clearInterval(iid)
      window.location.href = $2('#l1 a')[0].href
      setTimeout(window.close, 2000)
    }
  }, 100)
} else if (Url.pathname === '/torrents') {
  if (m) {
    value('.right input', m)
    click('.button')
  }
  const iid = setInterval(() => {
    remove('#facebox_overlay')
    if ($2('#submit_files').length > 0) {
      clearInterval(iid)
      click('#submit_files')
    }
  }, 100)
}
