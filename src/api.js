const url = (db, ps) => {
  const p = Object.keys({db, ...ps}).map(x => `${x}=${ps[x]}`).join('&')
  return `/.netlify/functions/api?${p}`
}

export const api = db => ({
  get: ps => fetch(url(db, ps)).then(r => r.json()),
  post: (ps, data) => fetch(url(db, ps), { method: 'POST', body: JSON.stringify(data) }).then(r => r.json()),
  save: (ps, data) => fetch(url(db, { type: 'save', ...ps }), { method: 'POST', body: JSON.stringify(data) }).then(r => r.json()),
})