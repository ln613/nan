import fetch from 'node-fetch'
import { getOrigin } from './http'

export const tap = x => { console.log(x); return x; }

const dbUrl = (type, db, doc) => `${getOrigin()}api?type=${type}&doc=${doc}&db=${db}`

export const get = async (type, db, doc) =>
  await fetch(dbUrl(type, db, doc))
    .then(r => r.json())
    .catch(e => e.response.text())

export const post = async (type, db, doc, data, def) =>
  await fetch(
    dbUrl(type, db, doc), 
    {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then(r => r.json())
    .catch(e => def || e.response.text())

export const search = async ({ id, db, doc, path }) =>
  await post(
    'search',
    db,
    doc,
    {
      query: { id },
      path,
    },
    []
  )

export const save = async ({ db, doc, obj }) => await post('save', db, doc, obj)
