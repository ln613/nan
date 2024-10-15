import { key, $3 } from './html'
import { sleep } from './utils'

key('^Enter', async () => {
  for (const btn of $3('.button-download')) {
    btn.click()
    await sleep(500)
  }
})
