import { makeAutoObservable, when } from "mobx"
import { max } from 'lodash'
import { api } from '../api'
import { tap } from '../utils/lang'

const { get, save } = api('mylist.note')

const Types = {
  payment: ['bill', 'credit card', 'membership', 'real estate', 'tax'],
  account: ['chequing'],
  'direct deposit': [],
  todo: [],
}

const Fields = {
  payment: ['desc', 'amount', 'frequency', 'date', 'cc', 'account', 'login', 'web', 'support'],
  'payment/credit card': ['amount', 'frequency', 'date', 'cc', 'bank', 'account', 'expire', 'cvv', 'login', 'web', 'support'],
  account: ['bank', 'account', 'min', 'login', 'web', 'support'],
}

export const Banks = ['rbc', 'cibc']

class TodoFilter {
  type
  subtype
  isBusiness

  get types() { return Object.keys(Types) }
  get subtypes() { return Types[this.type] || [] }

  setType = t => {
    this.type = t
    this.subtype = ''
  }

  constructor() {
    makeAutoObservable(this)
  }
}

class Todo {
  id
  type = 'payment'
  subtype
  desc
  isBusiness
  amount
  min
  frequency
  date
  bank
  account
  expire
  cvv
  cc
  login
  web
  support

  get types() { return Object.keys(Types) }
  get subtypes() { return Types[this.type] || [] }
  get isCC() { return this.subtype === 'credit card' }
  get isChequing() { return this.subtype === 'chequing' }
  get isPaymentSource() { return this.isCC || this.isChequing }
  get isPayment() { return this.type === 'payment' }
  get isAccount() { return this.type === 'account' }
  get isTodo() { return this.type === 'todo' }
  get isMonthly() { return this.frequency === 'monthly' }
  get isAnnually() { return this.frequency === 'annually' }
  get title() { return this.isPaymentSource
    ? `${this.bank.toUpperCase()} ${this.isBusiness ? 'Business' : 'Personal'} ${this.subtype}`
    : this.desc
  }
  get accounts() { return this.cvv ? [[this.account, this.expire, this.cvv].filter(y => y).join('/')] : this.account && this.account.split('/') }
  get username() { return this.login && this.login.split('/')[0] }
  get password() { return this.login && this.login.split('/')[1] }
  get supports() { return this.support && this.support.split('/') }
  get dateString() { return this.isMonthly
    ? `${this.frequency} on ${this.date}`
    : this.isAnnually
      ? `${this.frequency} on ${this.date}`
      : this.date
  }
  get fieldsKey() { return `${this.type}${this.subtype ? `/${this.subtype}` : ''}` }
  get fields() { return Object.fromEntries((Fields[this.fieldsKey] || Fields[this.type]).map(x => [x, true])) }

  constructor(o) {
    Object.assign(this, o)
    makeAutoObservable(this)
  }
}

class Todos {
  isSignedIn = false
  all = []
  todo
  filter = new TodoFilter()

  get filtered() { return this.all.filter(x => (!this.filter.type || this.filter.type == x.type) && (!this.filter.subtype || this.filter.subtype == x.subtype)) }
  get ccs() { return this.filtered.filter(x => x.isCC) }
  get chequings() { return this.filtered.filter(x => x.isChequing) }
  get paymentSources() { return this.all.filter(x => x.isPaymentSource) }
  get paymentOptions() { return this.paymentSources.map(x => ({ value: x.id, text: `${x.title} - ${x.accounts[0]}` })) }
  get payments() { return this.filtered.filter(x => x.isPayment) }
  get oneTimePayments() { return this.payments.filter(x => !x.frequency) }
  get repeatPayments() { return this.payments.filter(x => x.frequency) }
  get autoPayments() { return this.repeatPayments.filter(x => x.cc) }
  get accounts() { return this.filtered.filter(x => x.isAccount) }
  get todos() { return this.filtered.filter(x => x.isTodo) }
  get isEdit() { return !!this.todo }

  add = () => {
    this.todo = new Todo()
  }

  edit = t => {
    this.todo = t
  }

  save = async () => {
    if (!this.todo.id) this.todo.id = max(this.all.map(x => x.id)) + 1
    if (this.todo.amount) this.todo.amount = +this.todo.amount
    if (this.todo.cc) this.todo.cc = +(this.todo.cc.id || this.todo.cc)
    await save({ doc: 'todos' }, this.todo)
    this.all = []
    this.load()
    this.todo = null
  }

  cancelEdit = () => {
    this.todo = null
  }

  load = async () => {
    this.all = await get({ type: 'doc', doc: 'todos' }).then(r => r.map(x => new Todo(x)))
    this.autoPayments.forEach(p => p.cc = this.paymentSources.find(s => s.id === p.cc))
  }

  constructor() {
    makeAutoObservable(this)
    this.load()
  }
}

export const todos = new Todos()
