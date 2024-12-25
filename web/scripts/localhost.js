import { key, $1, $3 } from './html.js'
import { sleep } from './utils.js'

if ($1('address')?.innerText.includes('server running @ localhost')) {

  key('^Enter', async () => {
    console.log('ff')
  })
}
