import { makeAutoObservable } from "mobx"
import { api } from '../api'

// Initialize API with db="mylist.mylist" as specified
const { get, post } = api('mylist.mylist')

class DBTool {
  // Hierarchy state
  hierarchyData = null
  loading = false
  updateAllDocsLoading = false
  error = null
  
  // Selection state
  selectedCluster = null
  selectedDB = null
  selectedDoc = null
  
  // Backup state
  backupLoading = false
  backupResult = null
  backupError = null
  
  // Restore state
  backupList = []
  backupListLoading = false
  selectedBackup = null
  restoreDbName = ''
  restoreCluster = null
  restoreLoading = false
  restoreResult = null
  restoreError = null
  
  // Aggregation state
  aggQuery = ''
  funcText = ''
  queryResults = null
  queryLoading = false
  queryError = null
  saveSuccess = null
  
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
  
  // Get full DB path for API calls
  get fullDBPath() {
    if (!this.selectedCluster || !this.selectedDB) return null
    return `${this.selectedCluster}.${this.selectedDB}`
  }
  
  // Check if we can execute a query
  get canExecuteQuery() {
    return !this.queryLoading && !!this.selectedDoc
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
  
  // Aggregation methods
  setAggQuery = (value) => {
    this.aggQuery = value
  }
  
  setFuncText = (value) => {
    this.funcText = value
  }
  
  // Execute aggregation query
  executeQuery = async () => {
    // Validate all required fields are selected
    if (!this.selectedCluster || !this.selectedDB || !this.selectedDoc) {
      this.queryError = 'Please select cluster, database, and document first'
      return
    }
    
    try {
      this.queryLoading = true
      this.queryError = null
      this.saveSuccess = null
      
      // Create a new API instance with the selected db path
      const { get, post } = api(this.fullDBPath)
      
      // URL encode the aggregation query parameter
      const encodedAgg = encodeURIComponent(this.aggQuery)
      
      // Make the API call with type="flat"
      const result = await get({
        type: this.aggQuery ? "flat" : "doc",
        doc: this.selectedDoc,
        agg: encodedAgg
      })
      
      this.queryResults = result
      
      // Process and save results if function text is not default
      if (this.funcText && Array.isArray(result)) {
        try {
          // Create the function from funcText string
          // eslint-disable-next-line no-new-func
          const processFunc = eval(`x => { delete x._id; ${this.funcText} }`)
          
          // Apply the function to each item in the result
          result.forEach(item => processFunc(item))
          
          // Save the processed results
          const saveResponse = await post({
            type: "save",
            doc: this.selectedDoc
          }, result)
          
          // Store save success information
          this.saveSuccess = {
            message: 'Successfully saved processed results',
            details: saveResponse,
            timestamp: new Date().toISOString()
          }
          console.log('Successfully saved processed results', saveResponse)
        } catch (funcError) {
          console.error("Function processing error:", funcError)
          this.queryError = `Error processing function: ${funcError.message}`
        }
      }
    } catch (error) {
      console.error("Query error:", error)
      this.queryError = `Error executing query: ${error.message}`
      this.queryResults = null
    } finally {
      this.queryLoading = false
    }
  }
  
  // Backup the selected database
  backupSelectedDB = async () => {
    if (!this.fullDBPath) {
      this.backupError = 'Please select a database first'
      return
    }

    try {
      this.backupLoading = true
      this.backupError = null
      this.backupResult = null

      const { post } = api(this.fullDBPath)
      const result = await post({ type: 'backup' }, {})

      this.backupResult = result
    } catch (error) {
      console.error('Backup error:', error)
      this.backupError = `Backup failed: ${error.message}`
    } finally {
      this.backupLoading = false
    }
  }

  // Load backup list from Cloudinary
  loadBackupList = async () => {
    try {
      this.backupListLoading = true
      const result = await get({ type: 'listBackups' })
      this.backupList = result || []
    } catch (error) {
      console.error('Failed to load backup list:', error)
      this.backupList = []
    } finally {
      this.backupListLoading = false
    }
  }

  setSelectedBackup = (value) => {
    this.selectedBackup = value
  }

  setRestoreDbName = (value) => {
    this.restoreDbName = value
  }

  setRestoreCluster = (value) => {
    this.restoreCluster = value
  }

  // Restore a backup to a cluster
  restoreBackup = async () => {
    if (!this.selectedBackup || !this.restoreCluster) {
      this.restoreError = 'Please select both a backup and a target cluster'
      return
    }

    try {
      this.restoreLoading = true
      this.restoreError = null
      this.restoreResult = null

      const backup = this.backupList.find(b => b.name === this.selectedBackup)
      if (!backup) {
        this.restoreError = 'Selected backup not found'
        return
      }

      const result = await post({ type: 'restore' }, {
        url: backup.url,
        name: backup.name,
        cluster: this.restoreCluster,
        dbOverride: this.restoreDbName || undefined,
      })

      this.restoreResult = result
    } catch (error) {
      console.error('Restore error:', error)
      this.restoreError = `Restore failed: ${error.message}`
    } finally {
      this.restoreLoading = false
    }
  }

  // Refresh all data with a direct API call and save it
  refreshAllData = async () => {
    try {
      this.updateAllDocsLoading = true
      this.error = null
      
      // Make a direct API call with type="allDocs"
      const allDocsData = await get({ type: "allDocs" })
      
      // Save the allDocs result for future use
      await post({
        type: "save",
        db: "mylist.mylist",
        doc: "mylist"
      }, {
        id: "allDocs",
        docs: allDocsData
      })
      
      // Update the hierarchy data
      this.hierarchyData = allDocsData
      
      // Set initial selections
      if (this.clusterOptions.length > 0) {
        this.setSelectedCluster(this.clusterOptions[0])
      }
      
      this.updateAllDocsLoading = false
    } catch (error) {
      console.error("Failed to refresh data:", error)
      this.updateAllDocsLoading = false
      this.error = "Failed to refresh data hierarchy"
    }
  }
  
  // Load all data - first try to load from saved data, fall back to direct API call
  loadAllData = async () => {
    try {
      this.loading = true
      this.error = null
      
      try {
        // First try to load from the saved allDocs
        const savedData = await get({
          type: "doc",
          db: "mylist.mylist",
          doc: "mylist"
        })
        
        // If we have saved data and it contains the allDocs result
        if (savedData && savedData.length == 1 && savedData[0].id === "allDocs" && savedData[0].docs) {
          this.hierarchyData = savedData[0].docs
          console.log("Loaded allDocs from saved data")
        } else {
          // If no saved data, fall back to direct API call
          // Don't set loading to false since refreshAllData will handle its own loading state
          await this.refreshAllData()
          return
        }
      } catch (savedError) {
        console.error("Failed to load saved data:", savedError)
        // If loading saved data fails, fall back to direct API call
        // Don't set loading to false since refreshAllData will handle its own loading state
        await this.refreshAllData()
        return
      }
      
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