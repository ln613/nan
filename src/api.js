const base = (type, doc) => `https://nan-li.netlify.app/.netlify/functions/api?type=${type}&db=mylist.note&doc=${doc}`

export const get = (type, doc) => fetch(base(type, doc)).then(r => r.json())

export const post = (type, doc, data) => fetch(base(type, doc), { method: 'POST', body: JSON.stringify(data) }).then(r => r.json())

export const save = (doc, data) => post('save', doc, data)