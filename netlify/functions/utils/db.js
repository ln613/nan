import { MongoClient } from 'mongodb'
import { partition } from 'lodash'
import { tap } from '.'

export const clusters = Object.fromEntries(
  (process.env.CLUSTERS || '').split(',').map(x => [x.split('.')[0], x])
)

let curCluster = ''
let curDB = ''
let db = null

export const connectDB = async conn =>
  (!conn && db) ||
  (db = await MongoClient.connect(
    conn || process.env.DB_LOCAL || process.env.DB
  ).then(x => x.db()))

// connect('pcn'), connect('pcn.dmm')
export const connect = async clusterAndDb => {
  const [clusterName, dbName = clusterName] = clusterAndDb.split('.')
  if (
    curCluster !== clusterName ||
    curDB !== dbName ||
    !db ||
    db.s.namespace.db !== dbName
  ) {
    curCluster = clusterName
    curDB = dbName
    const conn = process.env.DBCS.replace(
      /\{cluster\}/,
      clusters[clusterName]
    ).replace(/\{db\}/, dbName)
    console.log(`Connect MongoDB ${clusterName} ${dbName}`)
    await connectDB(conn)
  }
}

export const listDBs = () => db.admin().listDatabases().then(r => r.databases.map(x => x.name).filter(x => x != 'admin' && x != 'local'))

export const listDocs = () => db.listCollections().toArray().then(r => r.map(x => x.name))

export const listAllDocs = async () => {
  const cs = {}
  for (let c in clusters) {
    await connect(c)
    const dbs = await listDBs().then(r => Object.fromEntries(r.map(x => [x, []])))
    for (let d in dbs) {
      await connect(`${c}.${d}`)
      dbs[d] = await listDocs()
    }
    cs[c] = dbs
  }
  return cs
}

export const initdocs = docs => {
  const f = k => r => db.collection(k).insertMany(docs[k])
  return Promise.all(
    Object.keys(docs).map(k => db.collection(k).drop().then(f(k)).catch(f(k)))
  )
}

export const initdata = d =>
  d
    ? Promise.resolve(d).then(r => initdocs(r))
    : httpGet(`${process.env.GITHUB_DB}db.json`).then(r => initdocs(r))

export const backup = () =>
  Promise.all(allDocs.map(get)).then(l =>
    fromPairs(l.map((d, i) => [allDocs[i], d]))
  )

export const count = doc => db.collection(doc).count()

export const get = doc =>
  db.collection(doc).find().project({ _id: 0 }).toArray()

export const getIdName = doc =>
  db.collection(doc).find().project({ _id: 0, id: 1, name: 1 }).toArray()

export const getById = (doc, id) =>
  db.collection(doc).findOne({ id: +id }, { projection: { _id: 0 } })

export const maxId = doc =>
  db
    .collection(doc)
    .find()
    .project({ _id: 0, id: 1 })
    .sort({ id: -1 })
    .limit(1)
    .toArray()
    .then(r => (r.length > 0 ? r[0].id + 1 : 0))

const getSortPair = s =>
  s[0] === '+' ? [s.slice(1), 1] : s[0] === '-' ? [s.slice(1), -1] : [s, 1]

const getSortObj = s =>
  s ? Object.fromEntries(s.split(',').map(getSortPair)) : {}

// 0: prop ('$videos')
// 1: number
// 2: map ({ name: 'Fiona' })
// 3: projectMap ({ id: 1, name: 0, title: '$videos.title' })
// 4: compareMap ({ rank: -1 })
// 5: name (default to Stage name)
const Stages = {
  u: ['unwind', 0],
  l: ['limit', 1],
  k: ['skip', 1],
  m: ['match', 2],
  a: ['addFields', 2],
  r: ['sample', 2],
  p: ['project', 3],
  s: ['sort', 4],
  c: ['count', 5],
  f: ['lookup', 6],
}

const Ops = {
  in: v => v.split(';'),
  first: v => '$' + v,
  //gt: (v, k) => ['$' + k, +v],
  //lt: (v, k) => ['$' + k, +v],
}

const strNum = v => {
  if (!v) return ''
  if (v.length > 2 && v[0] === "'" && v[v.length - 1] === "'") return v.slice(1, -1)
  return isNaN(+v) ? v : +v
}

export const flat = async (doc, agg) => {
  // agg = 'm_id=1,code='123',firstName=in$Nan;Fiona,name=regex$fan&u_songs&p_id,name=0,img=movies.img&s_type,date=-1&r_size=20'
  console.log(agg)
  const liftUps = []
  const stages = !agg
    ? [{ $match: {} }]
    : agg.split('&').map(s => {
        const ss = s.split('_')
        const stage = ss[0]
        const props = ss.slice(1).join('_')
        const $stage = `$${Stages[stage][0]}`
        const type = Stages[stage][1]

        if (type === 0) return [{ [$stage]: `$${props}` }]
        if (type === 1) return [{ [$stage]: +props }]
        if (type === 2) {
          const ps = props.split(',').map(p => {
            let [k, v] = p.split('=')
            if (v.includes('$')) {
              // prop value contains operator
              const [op, opv] = v.split('$')
              return [k, { [`$${op}`]: strNum(Ops[op] ? Ops[op](opv, k) : opv) }]
            }
            if (v.includes('.')) {
              if (stage === 'a') liftUps.push(k)
              v = '$' + v
            }
            return [k, strNum(v)]
          }).filter(x => x)
          return ps.length > 0 ? [{ [$stage]: Object.fromEntries(ps) }] : []
        }
        if (type === 3 || type === 4) {
          const ps = props.split(',').map(p => {
            const isMinus = p.startsWith('-')
            const k = isMinus ? p.slice(1) : p
            const v = isMinus ? (type === 3 ? 0 : -1) : 1
            return [k, v]
          })
          if (type === 3 && tap(liftUps).length > 0) liftUps.forEach(x => ps.push([x, 1]))
          return [{ [$stage]: Object.fromEntries(ps) }]
        }
        if (type === 5) return [{ [$stage]: props || stage }]
        if (type === 6) return props.split(',').reduce((p, c) => {
          const ps = c.split('|')
          const prefix = p.length > 0 ? `${p[p.length - 3]['$lookup'].as}.` : ''
          return [
            ...p,
            { '$lookup': {
              from: ps.length > 1 ? ps[1] : `${ps[0]}s`,
              localField: `${prefix}${ps[0]}_id`,
              foreignField: 'id',
              as: ps[0]
            }},
            { '$unwind': `$${ps[0]}` },
            { '$project': { [`${ps[0]}._id`]: 0 } }
          ]
        }, [])
      }).flat().filter(x => x)
  stages.push({ '$project': { _id: 0 } })
  console.log(doc, stages)
  const r = await db.collection(doc).aggregate(stages).toArray()
  console.log(r.length)
  return r
}

export const search = (doc, query = {}, fields = '', sort = '') => {
  console.log(doc, query, fields, sort)
  const qs = Object.keys(query)
  const q1 = qs.filter(x => !x.includes('.'))
  const q = Object.fromEntries(q1.map(x => [x, query[x]]))
  const q2 = qs.filter(x => x.includes('.'))
  const fs1 = q2
    .map(x => [x.split('.'), query[x]])
    .map(([k, v]) => [k[0], { $elemMatch: { [k[1]]: v } }])
  const fs = Object.fromEntries([
    ['_id', 0],
    ...(fields ? fields.split(',').map(x => [x, 1]) : []),
    ...fs1,
  ])
  const ss = getSortObj(sort)
  return db.collection(doc).find(q).project(fs).sort(ss).toArray()
}

export const sample = (doc, size, sort) =>
  db
    .collection(doc)
    .aggregate([{ $sample: { size } }])
    .sort(getSortObj(sort))
    .toArray()

export const add = (doc, obj) => db.collection(doc).insertMany(makeArray(obj))

export const replace = async (doc, obj, id = 'id') => {
  const list = makeArray(obj)

  if (id === 'id' && list.some(o => !o.id)) {
    const id1 = await maxId(doc)
    const id = Math.max(...list.map(o => o.id || 0), id1) + 1
    list.filter(o => !o.id).forEach((o, i) => (o.id = id + i))
  }

  await Promise.all(
    list.map(o => {
      delete o._id
      return db.collection(doc).replaceOne({ [id]: o[id] }, o, { upsert: true })
    })
  )

  return list
}

export const addToList = (doc, id, list, obj) =>
  db.collection(doc).updateOne({ id: +id }, { $addToSet: { [list]: obj } })

export const replaceList = (doc, id, list, obj) =>
  db
    .collection(doc)
    .updateOne(
      { id: +id, [list + '.id']: obj.id },
      { $set: { [list + '.$']: obj } }
    )

export const update = (doc, obj) =>
  db.collection(doc).updateOne({ id: obj.id }, { $set: obj })

export const remove = (doc, id) => db.collection(doc).deleteOne({ id: +id })

export const removeAll = doc => db.collection(doc).deleteMany({})

const makeArray = x => (Array.isArray(x) ? x : [x])
