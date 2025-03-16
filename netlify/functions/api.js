import { makeApi } from './utils/http'
import { connect, listDocs, listDBs, listAllDocs, get, count, sample, search, flat, replace, getById, maxId, clusters } from './utils/db'
import { tap } from './utils'
import { translate } from './utils/google'
import { cdupload, cdVersion, cdList } from './utils/cd'
// import { initAI, chat } from './utils/ai'

// Define public endpoints that don't require authentication
const publicEndpoints = [
  { method: 'get', type: 'flat' },
  { method: 'get', type: 'translate' },
  { method: 'get', type: 'doc' },
  { method: 'get', type: 'dbs' },
  { method: 'get', type: 'docs' },
  { method: 'get', type: 'allDocs' },
  { method: 'post', type: 'save' },
  { method: 'post', type: 'search' },
  { method: 'post', type: 'flat' },
  // Add other public endpoints if needed
];

export const handler = makeApi({
  handlers: {
    get: {
      clusters: q => Promise.resolve(clusters),
      dbs: q => listDBs(),
      docs: q => listDocs(),
      allDocs: q => listAllDocs(),
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
  publicEndpoints: publicEndpoints,
})

const _search = async ({ doc, query, fields, sort, path }) => {
  let list = await search(doc, query, fields, sort)
  if (list.length > 0 && path) {
    list = path.split('.').reduce((p, c) => p[0][c], list) || []
  }
  return list
}
