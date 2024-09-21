import { makeApi } from './utils/http'

export const handler = makeApi({
  handlers: {
    get: {
      test: q => 'ok',
    },
  },
})
