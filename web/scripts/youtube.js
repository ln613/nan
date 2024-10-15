import { $1, css, addStyle, key, parseUrl } from './html'

let showProgress = true
let isTheater = false

addStyle('.ytp-ad-image-overlay, .ytp-ad-overlay-slot {display: none;}')

setInterval(() => {
  if (parseUrl().pathname === '/watch') {
    css('#chat', 'display', 'none')

    const _isTheater =
      !!$1('ytd-watch-flexy[theater]') && !document.fullscreenElement

    if (isTheater !== _isTheater) {
      isTheater = _isTheater
      css('#masthead-container', 'display', isTheater ? 'none' : 'block')
      css('#player-wide-container', 'maxHeight', isTheater ? '100vh' : '')
      css('#player-wide-container', 'height', isTheater ? '100vh' : '')
      css('#content', 'marginTop', isTheater ? '-56px' : '0')
    }
    css('.ytp-chrome-top', 'display', showProgress ? 'block' : 'none')
    css('.ytp-chrome-bottom', 'display', showProgress ? 'block' : 'none')
    // css('.ytp-progress-bar-container', 'display', showProgress ? 'block' : 'none');

    const skipBtn = $1('button.ytp-ad-skip-button-modern')
    if (skipBtn) skipBtn.click()

    const video = $1('video')
    if (video) {
      if (window.scrollY === 0) video.focus()
      $1('.ytp-ad-player-overlay') && (video.currentTime = video.duration)
    }
  }
}, 100)

const jump = d => () => {
  const video = $1('video')
  if (video) video.currentTime = video.currentTime + d
}

key('/', jump(-2))
key('Delete', jump(2))
key('^ArrowLeft', jump(-15))
key('^ArrowRight', jump(15))
key('\\', () => (showProgress = !showProgress))
