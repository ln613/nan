import { MongoClient } from 'mongodb'
import { partition } from 'lodash'

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

export const list = () => Object.keys(db)

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
    .then(r => (r.length > 0 ? r[0].id : 0))

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
  m: ['match', 2],
  r: ['sample', 2],
  p: ['project', 3],
  s: ['sort', 4],
  k: ['skip', 1],
  c: ['count', 5],
}

const Ops = {
  in: x => x.split(';'),
  first: x => '$' + x,
}

export const flat = async (doc, agg) => {
  // agg = 'm_id=1&u_songs&p_id,name&s_date'
  console.log(agg)
  const stages = !agg
    ? [{ $match: {} }]
    : agg.split('&').map(s => {
        const [stage, props] = s.split('_')
        const $stage = `$${Stages[stage][0]}`
        const type = Stages[stage][1]
        let value = null
        if (type === 0) value = `$${props}`
        else if (type === 1) value = +props
        else if (type === 5) value = props || stage
        else {
          const ps = props.split(',').map(p => {
            let [k, v = '1'] = p.split('=')
            if (v.includes('$')) {
              // prop value contains operator
              const [op, opv] = v.split('$')
              return [k, { [`$${op}`]: Ops[op] ? Ops[op](opv) : opv }]
            }
            if (v.includes('.')) v = '$' + v
            return [k, isNaN(+v) ? v : +v]
          })
          value = Object.fromEntries(ps)
        }
        return { [$stage]: value }
      })
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

export const remove = (doc, obj) => db.collection(doc).remove({ id: obj.id })

export const removeAll = doc => db.collection(doc).deleteMany({})

const makeArray = x => (Array.isArray(x) ? x : [x])
