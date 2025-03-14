import { makeAutoObservable } from "mobx"
import { api } from '../api'

// Initialize API with db="mylist.mylist" as specified
const { get } = api('mylist.mylist')

class DBTool {
  databases = []
  selectedDB = null
  loading = false
  error = null

  setSelectedDB = (db) => {
    this.selectedDB = db
  }
  
  // Load all databases using type="dbs"
  loadDatabases = async () => {
    try {
      this.loading = true
      this.error = null
      
      // Call the API with type="dbs" as specified
      this.databases = await get({ type: "dbs" })
      
      if (this.databases.length > 0) {
        this.selectedDB = this.databases[0]
      }
      
      this.loading = false
    } catch (error) {
      console.error("Failed to load databases:", error)
      this.loading = false
      this.error = "Failed to load databases"
      this.databases = []
    }
  }

  constructor() {
    makeAutoObservable(this)
    // Load databases when the store is initialized
    this.loadDatabases()
  }
}

export const dbtool = new DBTool()