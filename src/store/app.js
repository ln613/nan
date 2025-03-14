import { makeAutoObservable } from "mobx"
import { api } from '../api'

const { get } = api('pcn.list')

class App {
  imgLists = []

  getImgList = id => this.imgLists.find(x => x.id === id)
  
  load = async () => {
    try {
      const params = { 
        type: "doc", 
        doc: "list"
      }
      
      this.imgLists = await get(params)
    } catch (error) {
      console.error("Failed to load imgLists:", error)
      this.imgLists = []
    }
  }

  constructor() {
    makeAutoObservable(this)
    this.load()
  }
}

export default new App()