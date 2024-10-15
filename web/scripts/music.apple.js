import { key, $1 } from './html.js'

const goto = d =>
  document
    .querySelector('amp-chrome-player')
    .shadowRoot.querySelector('apple-music-playback-controls')
    .shadowRoot.querySelector(`amp-playback-controls-item-skip.${d}`)

key('ArrowLeft', () => {
  const player = $1('audio')
  if (player && player.currentTime > 5) player.currentTime -= 5
})

key('ArrowRight', () => {
  const player = $1('audio')
  if (player && player.currentTime < player.duration - 5)
    player.currentTime += 5
})

key('ArrowUp', () => {
  goto('previous').click()
  goto('previous').click()
})

key('ArrowDown', () => {
  goto('next').click()
})
