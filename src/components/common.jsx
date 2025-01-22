import { isObject } from 'lodash'
import { createContext, useContext, Children } from 'react'
import { tap } from '../utils/lang'

const FormContexts = {}

export const Cards = ({ title, items = [], onDoubleClick, lines = [] }) => items.length > 0 &&
  <div className="mb-4">
    <div className='f aic'>
      <div className='h2 mb-2'>{title || ''}</div>
      <div className='grow'></div>
    </div>
    <div className="cards">
      {items.map((t, i) => 
        <div className="card" key={i} onDoubleClick={e => onDoubleClick(e, t)}>
          {lines.map(l => l(t))}
        </div>
      )}
    </div>
  </div>

export const Form = ({ children, name, obj, className }) => {
  let Context = FormContexts[name]
  if (!Context) FormContexts[name] = Context = createContext(null)
  const cs = Children.map(children, c => c && { ...c, props: { ...c.props, formName: name } })
  return (
    <Context.Provider value={obj}>
      <form className={className || 'p-4 fc gap-4'}>
        {cs}
      </form>
    </Context.Provider>
  )
}

const withFormCtx = f => p => {
  const obj = p.obj || useContext(FormContexts[p.formName])
  const title = p.title || p.field
  const id = `i_${title.replace(/ /g, '_')}`
  return f({...p, obj, id, title })
}

const LabelInput = ({ title, id, row, children }) =>
  <div className={`${row ? 'f aic' : 'fc'} gap-2`}>
    <label htmlFor={id} className='form-label'>{title}</label>
    {children}
  </div>

export const Text = withFormCtx(({ field, title, row, obj, id }) =>
  <LabelInput title={title} id={id} row={row}>
    <input id={id} className='input' type='text' defaultValue={obj[field]} onChange={e => (obj[field] = e.target.value)} />
  </LabelInput>
)

const onSelectChange = (e, onChange, obj, field) => {
  const v = e.target.value
  if (onChange) {
    onChange(v)
  } else {
    const o = obj[field]
    if (isObject(o)) o.id = v
    else obj[field] = v
  }
}

export const Select = withFormCtx(({ field, options, required, title, onChange, row, obj, id }) =>
  <LabelInput title={title} id={id} row={row}>
    <select id={id} className='input' onChange={e => onSelectChange(e, onChange, obj, field)} defaultValue={obj[field]?.id || obj[field]}>
      {(required ? [] : ['']).concat(options || []).map(o => <option value={o.value || o}>{o.text || o}</option>)}
    </select>
  </LabelInput>
)

export const CheckBox = withFormCtx(({ field, title, obj, id }) =>
  <div className='f aic gap-2'>
    <label htmlFor={id} className='form-label'>{title}</label>
    <input id={id} className='checkbox' type='checkbox' defaultChecked={obj[field]} onChange={e => (obj[field] = e.target.checked)} />
  </div>
)
