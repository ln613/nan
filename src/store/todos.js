import { makeAutoObservable } from "mobx"

class Todos {
    all = []

    constructor() {
        makeAutoObservable(this)
        this.load()
    }

    async load() {
      this.all = await fetch('https://nan-li.netlify.app/.netlify/functions/api?type=doc&db=mylist.note&doc=todos').then(r => r.json())
    }
}

export const todos = new Todos()
