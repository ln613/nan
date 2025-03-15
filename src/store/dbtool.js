import { makeAutoObservable } from "mobx"
import { api } from '../api'

// Initialize API with db="mylist.mylist" as specified
const { get } = api('mylist.mylist')

class DBTool {
  // Hierarchy state
  hierarchyData = null
  loading = false
  error = null
  
  // Selection state
  selectedCluster = null
  selectedDB = null
  selectedDoc = null
  
  // Derived lists for dropdowns
  get clusterOptions() {
    if (!this.hierarchyData) return []
    return Object.keys(this.hierarchyData)
  }
  
  get dbOptions() {
    if (!this.hierarchyData || !this.selectedCluster) return []
    return Object.keys(this.hierarchyData[this.selectedCluster] || {})
  }
  
  get docOptions() {
    if (!this.hierarchyData || !this.selectedCluster || !this.selectedDB) return []
    return this.hierarchyData[this.selectedCluster]?.[this.selectedDB] || []
  }
  
  // Selection methods
  setSelectedCluster = (cluster) => {
    this.selectedCluster = cluster
    this.selectedDB = null
    this.selectedDoc = null
    
    // Auto select first DB if available
    if (this.dbOptions.length > 0) {
      this.selectedDB = this.dbOptions[0]
      
      // Auto select first document if available
      if (this.docOptions.length > 0) {
        this.selectedDoc = this.docOptions[0]
      }
    }
  }
  
  setSelectedDB = (db) => {
    this.selectedDB = db
    this.selectedDoc = null
    
    // Auto select first document if available
    if (this.docOptions.length > 0) {
      this.selectedDoc = this.docOptions[0]
    }
  }
  
  setSelectedDoc = (doc) => {
    this.selectedDoc = doc
  }
  
  // Load all data with a single API call
  loadAllData = async () => {
    try {
      this.loading = true
      this.error = null
      
      // Make a single API call with type="allDocs"
      this.hierarchyData = await get({ type: "allDocs" })
      
      // Set initial selections
      if (this.clusterOptions.length > 0) {
        this.setSelectedCluster(this.clusterOptions[0])
      }
      
      this.loading = false
    } catch (error) {
      console.error("Failed to load data:", error)
      this.loading = false
      this.error = "Failed to load data hierarchy"
      this.hierarchyData = null
    }
  }

  constructor() {
    makeAutoObservable(this)
    // Load all data when the store is initialized
    this.loadAllData()
  }
}

export const dbtool = new DBTool()