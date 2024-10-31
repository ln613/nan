import { Url, $3 } from './utils.js'

const db = dbInit('pcn.dmm', ['model'])

if (Url.pathname.startsWith('/actors')) {
  const names = $3('.section-title span').slice(0, -1).map(x => x.innerText.split(', ')).flat()
  appendChild('.section-title h2', '<a href="#" id="import_model">Import</a>')
  $1('#import_model').addEventListener('click', async () => {
    const m = await db.model.flat(`p_jname,name,code,javdb&m_jname=in$${names.join(';')}`)
    console.log(m)
  });
}