import { makeApi } from './utils/http'
import {
  connect,
  get,
  count,
  sample,
  search,
  flat,
  replace,
  getById,
  maxId,
  clusters,
} from './utils/db'
// import { initAI, chat } from './utils/ai'

export const handler = makeApi({
  handlers: {
    get: {
      test: q => Promise.resolve(clusters),
      doc: q => get(q.doc),
      count: q => count(q.doc),
      getById: q => getById(q.doc, q.params.id),
      search: q => _search({ doc: q.doc, ...q.params }),
      flat: q => flat(q.doc, q.params.agg),
      maxId: q => maxId(q.doc),
    },
    post: {
      search: (q, b) => _search({ doc: q.doc, ...b }),
      sample: (q, b) => sample(q.doc, +b.size, b.sort),
      save: (q, b) => replace(q.doc, b),
      flat: (q, b) => flat(q.doc, b.agg),
      // update: async (q, b) => {
      //   await connect(b.cluster, b.db)
      //   return await DB.replace(b.col, b.data)
      // },

      // ai
      // chat: (q, b) => chat(b.text),
    },
  },
  connectDB: connect,
  // initAI: initAI,
  nocache: true,
})

const _search = async ({ doc, query, fields, sort, path }) => {
  let list = await search(doc, query, fields, sort)
  if (list.length > 0 && path) {
    list = path.split('.').reduce((p, c) => p[0][c], list) || []
  }
  return list
}
