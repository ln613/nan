import { makeAutoObservable } from "mobx"
import { api } from '../api'
import { replaceWithObj } from "../utils/string"
import { tap } from "../utils/lang"

class ImageItem {
  id
  src
  mid
  name
  rate
  rating
  rank
  
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

  load = async () => {
    this.isLoading = true
    try {
      if (!this.listParams.db) return
      const { get } = api(this.listParams.db)
      const { doc, agg } = this.listParams
      const result = await get({ type: 'flat', doc, agg })
      this.images = Array.isArray(result) ? result.map(img => new ImageItem(img)) : []
    } catch (error) {
      console.error("Failed to load images:", error)
      this.images = []
    } finally {
      this.isLoading = false
    }
  }

  constructor(listParams = {}) {
    this.listParams = listParams
    makeAutoObservable(this)
    this.load()
  }

  dispose() {
    // Clean up any subscriptions or resources if needed
    this.images = []
  }
}
