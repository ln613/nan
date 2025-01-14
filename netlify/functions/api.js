import { makeApi } from './utils/http'
import { connect, listDocs, listDBs, listAllDocs, get, count, sample, search, flat, replace, getById, maxId, clusters } from './utils/db'
import { tap } from './utils'
import { translate } from './utils/google'
import { cdupload, cdVersion, cdList } from './utils/cd'
// import { initAI, chat } from './utils/ai'

export const handler = makeApi({
  handlers: {
    get: {
      test: q => Promise.resolve(clusters),
      dbs: q => listDBs(),
      docs: q => listDocs(),
      allDocs: q => listAllDocs(q.clusters),
      doc: q => get(q.doc),
      count: q => count(q.doc),
      getById: q => getById(q.doc, q.id),
      search: q => _search({ doc: q.doc, ...q.params }),
      flat: q => flat(q.doc, tap(q).agg),
      maxId: q => maxId(q.doc),

      // cd
      cdVer: q => cdVersion(),
      cdList: q => cdList(),

      // google
      translate: q => translate(q.txt, q.to)
    },
    post: {
      search: (q, b) => _search({ doc: q.doc, ...b }),
      sample: (q, b) => sample(q.doc, +b.size, b.sort),
      save: (q, b) => replace(q.doc, b, q.id), // q.id specify the identity field
      flat: (q, b) => flat(q.doc, b.agg),
      // update: async (q, b) => {
      //   await connect(b.cluster, b.db)
      //   return await DB.replace(b.col, b.data)
      // },

      // cd
      cdupload: (q, b) => cdupload(),

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
