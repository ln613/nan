import { makeAutoObservable } from "mobx"
import { api } from '../api'
import { replaceWithObj } from "../utils/string"
import { tap } from "../utils/lang"

class ImageItem {
  id
  src
  mid
  pid
  code
  name
  jname
  title
  rate
  rating
  coverRate
  rank
  date
  
  get score() {
    return this.rate || this.rating || this.rank
  }

  constructor(o) {
    Object.assign(this, o)
    makeAutoObservable(this)
  }
}

export class ImageList {
  isLoading = false
  images = []
  listParams = {}
  routeParams = {}

  get isEmpty() {
    return this.images.length === 0
  }

  get count() {
    return this.images.length
  }

  getSrc(img) {
    return img.src || replaceWithObj(img, this.listParams.src)
  }

  getLink(img) {
    return this.listParams.link ? replaceWithObj(img, this.listParams.link) : '#'
  }

  getTitle(img) {
    return replaceWithObj(img, this.listParams.text)
  }

  load = async () => {
    this.isLoading = true
    try {
      if (!this.listParams.db) return
      const { get } = api(this.listParams.db)
      const { doc, agg } = this.listParams
      
      const result = await get({
        type: 'flat',
        doc,
        agg: replaceWithObj(this.routeParams, agg)
      })
      
      this.images = Array.isArray(result) ? result.map(img => new ImageItem(img)) : []
      console.log(this.images.length)
    } catch (error) {
      console.error("Failed to load images:", error)
      this.images = []
    } finally {
      this.isLoading = false
    }
  }

  constructor(listParams = {}, routeParams = {}) {
    this.listParams = {
      cols: 10,
      rows: 1,
      ...listParams
    }
    this.routeParams = routeParams
    
    makeAutoObservable(this)
    this.load()
  }

  dispose() {
    this.images = []
  }
}
