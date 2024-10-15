import { key, $3 } from './html.js'
import { sleep } from './utils.js'

key('^Enter', async () => {
  for (const btn of $3('.button-download')) {
    btn.click()
    await sleep(500)
  }
})
