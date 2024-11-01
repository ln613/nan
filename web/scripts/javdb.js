import { Url, $3, appendChild, $1 } from './html.js'
import { dbInit, tap } from './utils.js'

const db = dbInit('pcn.dmm', ['model'])

const init = async () => {
  if (Url.pathname.startsWith('/actors')) {
    const names = $3('.section-title span').slice(0, -1).map(x => x.innerText.split(', ')).flat()
    const ms = await db.model.flat(`p_jname,name,code,javdb&m_jname=regex$${names.join('|')}`)

    appendChild('.section-title h2', '<a href="#" id="import_model">Import</a>')
    $1('#import_model').addEventListener('click', async () => {
      const m1 = await db.model.flat(`p_code&m_code=regex$M0&s_code=-1&l_1`)
      const code = `M0${+m1[0].code.slice(1) + 1}`
      const javdb = Url.pathname.slice(Url.pathname.lastIndexOf('/') + 1)
      await db.model.save({ code, jname: names.join(','), rate: 900, javdb }, 'code')
      window.location.reload()
    })

    ms.forEach((m, i) => {
      appendChild('.section-title h2', `<a href="#" id="update_model_${i+1}">Update ${m.jname}</a>`)
      $1(`#update_model_${i+1}`).addEventListener('click', async () => {
        window.location.href = `http://localhost:691/movies/model/${m.code}`
      })
    })
  }
}

init()