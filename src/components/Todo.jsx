import { todos, Banks } from '../store/todos'
import { Cards, Form, Text, Select, CheckBox } from './common'
import { observer } from "mobx-react-lite"
import Navigation from './Navigation'
import { FcCustomerSupport, FcCalendar } from "react-icons/fc";
import { FaRegCreditCard } from "react-icons/fa6";
import { FaUserCircle, FaSignInAlt, FaArrowCircleUp } from "react-icons/fa";
import { HiExternalLink } from "react-icons/hi";
import avatar from '../assets/avatar.png';
import { tap } from '../utils/lang'

const edit = (e, t) => {
  if (e.target.children.length > 0) todos.edit(t)
  else navigator.clipboard.writeText(e.target.innerText)
}

const line = (text, icon, style = '') =>
  <div className='f aic'>
    <div onClick={() => navigator.clipboard.writeText(text)}>{icon}</div>
    <div className={`${icon ? 'pl-1' : ''} ${style}`}>{text}</div>
  </div>

const lines = (l, icon, style = '') => (l || []).map((t, i) => <div key={i}>{line(t, icon, style)}</div>)

const title = t => line(t.title, t.isBusiness ? <img src={avatar} className='w-4' /> : null, 'fb blue')

const amount = t => line(`$${t.amount}`, null, 'fb red')

const date = t => line(t.dateString, <FcCalendar />)

const accounts = t => lines(t.accounts, <FaUserCircle />)

const min = t => line(`Min: ${t.min}`, <FaArrowCircleUp />)

const paymentSource = t => t.cc && lines([t.cc.title, t.cc.accounts[0]], <FaRegCreditCard className='green' />)

const loginInfo = t =>
  <>
    {t.web && line(<a href={t.web}>{t.web}</a>, <HiExternalLink />, 'blue')}
    {t.login && line(
      <div><span className='purple'>{t.username}</span>/<span className='red'>{t.password}</span></div>,
      <FaSignInAlt className='purple' />
    )}
    {lines(t.supports, <FcCustomerSupport />)}
  </>

const EditCards = ({title, items, lines}) =>
  <Cards title={title} items={items} onDoubleClick={edit} lines={lines} />

const OneTimePayments = observer(() =>
  <EditCards title="One-Time Payments" items={todos.oneTimePayments} lines={[title, amount, date]} />
)
const RepeatPayments = observer(() =>
  <EditCards title="Repeat Payments" items={todos.repeatPayments} lines={[title, amount, date, accounts, paymentSource, loginInfo]} />
)

const Accounts = observer(() =>
  <EditCards title="Accounts" items={todos.accounts} lines={[title, accounts, min, loginInfo]} />
)

const Todos = observer(() =>
  <EditCards title="Todos" items={todos.todos} lines={[title, date]} />
)

const Nav = observer(() =>
  <nav className="f aic gap-2 sticky top-0 bg-gray-100/90 border-b p-2">
    <img src={avatar} className='w-8 h-8' />
    <div className='grow'></div>
    {!todos.isEdit && <Filters />}
    {todos.isEdit ? <SaveButtons /> : <EditButtons />}
  </nav>
)

const Filters = observer(() =>
  <Form obj={todos.filter} name="form_filter" className='f gap-2'>
    <Select field='type' options={todos.filter.types} onChange={todos.filter.setType} row />
    <Select field='subtype' options={todos.filter.subtypes} row />
  </Form>
)

const EditButtons = () =>
  <div className='f'>
    <button className='btn btn-blue' onClick={todos.add}>Add</button>
  </div>

const SaveButtons = () =>
  <div className='f gap-2'>
    <button className='btn btn-green' onClick={todos.save}>Save</button>
    <button className='btn btn-red' onClick={todos.cancelEdit}>Cancel</button>
  </div>

const Body = observer(() =>
  todos.isEdit ? <Edit t={todos.todo} /> : <TodoList />
)

const TodoList = () =>
  <div className='p-2'>
    <OneTimePayments />
    <RepeatPayments />
    <Accounts />
    <Todos />
  </div>

const Edit = observer(({ t }) =>
  <Form obj={t} name="form_edit">
    <Select field="type" options={t.types} required />
    <Select field="subtype" options={t.subtypes} />
    <CheckBox field="isBusiness" />
    {t.fields.desc && <Text field="desc" />}
    {t.fields.amount && <Text field="amount" />}
    {t.fields.min && <Text field="min" />}
    {t.fields.frequency && <Select field="frequency" options={['monthly', 'annually']} />}
    {t.fields.date && <Text field="date" />}
    {t.fields.cc && <Select field="cc" options={todos.paymentOptions} />}
    {t.fields.bank && <Select field="bank" options={Banks} />}
    {t.fields.account && <Text field="account" />}
    {t.fields.expire && <Text field="expire" />}
    {t.fields.cvv && <Text field="cvv" />}
    {t.fields.login && <Text field="login" />}
    {t.fields.web && <Text field="web" />}
    {t.fields.support && <Text field="support" />}
  </Form>
)

export default () => 
  <>
    <Nav />
    <Body />
  </>
