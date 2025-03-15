import { useState, useEffect } from 'react'
import { observer } from 'mobx-react-lite'
import { dbtool } from '../store/dbtool'

const DBTool = observer(() => {
  // Use the shared dbtool instance
  const store = dbtool

  // Handle selection changes
  const handleClusterChange = (e) => {
    store.setSelectedCluster(e.target.value)
  }

  const handleDBChange = (e) => {
    store.setSelectedDB(e.target.value)
  }

  const handleDocChange = (e) => {
    store.setSelectedDoc(e.target.value)
  }

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Database Tool</h1>
      
      {store.loading ? (
        <div className="text-gray-500 italic">Loading database hierarchy...</div>
      ) : store.error ? (
        <div className="text-red-500">{store.error}</div>
      ) : (
        <div className="space-y-4">
          {/* Cluster dropdown */}
          <div className="flex items-center">
            <label htmlFor="clusterSelect" className="w-24 font-semibold">Cluster:</label>
            <select
              id="clusterSelect"
              className="flex-1 p-2 border rounded"
              value={store.selectedCluster || ''}
              onChange={handleClusterChange}
              disabled={store.clusterOptions.length === 0}
            >
              {store.clusterOptions.length === 0 ? (
                <option value="">No clusters available</option>
              ) : (
                store.clusterOptions.map(cluster => (
                  <option key={cluster} value={cluster}>{cluster}</option>
                ))
              )}
            </select>
          </div>
          
          {/* Database dropdown */}
          <div className="flex items-center">
            <label htmlFor="dbSelect" className="w-24 font-semibold">Database:</label>
            <select
              id="dbSelect"
              className="flex-1 p-2 border rounded"
              value={store.selectedDB || ''}
              onChange={handleDBChange}
              disabled={!store.selectedCluster || store.dbOptions.length === 0}
            >
              {!store.selectedCluster ? (
                <option value="">Select a cluster first</option>
              ) : store.dbOptions.length === 0 ? (
                <option value="">No databases available</option>
              ) : (
                store.dbOptions.map(db => (
                  <option key={db} value={db}>{db}</option>
                ))
              )}
            </select>
          </div>
          
          {/* Document dropdown */}
          <div className="flex items-center">
            <label htmlFor="docSelect" className="w-24 font-semibold">Document:</label>
            <select
              id="docSelect"
              className="flex-1 p-2 border rounded"
              value={store.selectedDoc || ''}
              onChange={handleDocChange}
              disabled={!store.selectedDB || store.docOptions.length === 0}
            >
              {!store.selectedDB ? (
                <option value="">Select a database first</option>
              ) : store.docOptions.length === 0 ? (
                <option value="">No documents available</option>
              ) : (
                store.docOptions.map(doc => (
                  <option key={doc} value={doc}>{doc}</option>
                ))
              )}
            </select>
          </div>
        </div>
      )}
    </div>
  )
})

export default DBTool