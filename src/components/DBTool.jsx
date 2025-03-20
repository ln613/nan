import { observer } from 'mobx-react-lite'
import { dbtool } from '../store/dbtool'

const DBTool = observer(() => {
  // Use the shared dbtool instance
  const store = dbtool

  // Event handlers
  const handleClusterChange = (e) => {
    store.setSelectedCluster(e.target.value)
  }

  const handleDBChange = (e) => {
    store.setSelectedDB(e.target.value)
  }

  const handleDocChange = (e) => {
    store.setSelectedDoc(e.target.value)
  }
  
  const handleAggChange = (e) => {
    store.setAggQuery(e.target.value)
  }
  
  const handleFuncChange = (e) => {
    store.setFuncText(e.target.value)
  }
  
  const handleSubmit = (e) => {
    e.preventDefault()
    store.executeQuery()
  }

  return (
    <div className="p-4 max-w-xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Database Tool</h1>
            <button
              type="button"
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
              onClick={() => store.refreshAllData()}
              disabled={store.updateAllDocsLoading}
            >
              {store.updateAllDocsLoading ? 'Updating...' : 'Update AllDocs'}
            </button>
          </div>
          
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
          
          {/* Aggregation query input */}
          <form onSubmit={handleSubmit} className="space-y-4 mt-6">
            <div className="flex items-center">
              <label htmlFor="aggInput" className="w-24 font-semibold">Aggregation:</label>
              <input
                id="aggInput"
                type="text"
                className="flex-1 p-2 border rounded"
                value={store.aggQuery}
                onChange={handleAggChange}
                placeholder="Enter aggregation query"
              />
            </div>
            
            {/* Function text area for processing results */}
            <div className="flex items-start">
              <label htmlFor="funcInput" className="w-24 font-semibold mt-2">Function:</label>
              <textarea
                id="funcInput"
                className="flex-1 p-2 border rounded font-mono h-24"
                value={store.funcText}
                onChange={handleFuncChange}
                placeholder="Enter function to process results"
              />
            </div>
            
            <div className="text-right">
              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                disabled={!store.canExecuteQuery}
              >
                {store.queryLoading ? 'Running...' : 'Run Query'}
              </button>
            </div>
          </form>
          
          {/* Query results section */}
          {store.queryError && (
            <div className="mt-4 p-3 bg-red-100 text-red-700 rounded">
              {store.queryError}
            </div>
          )}
          
          {store.queryResults && (
            <div className="mt-4">
              <h2 className="text-xl font-semibold mb-2">Results:</h2>
              <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-80">
                {JSON.stringify(store.queryResults, null, 2)}
              </pre>
            </div>
          )}
          
          {/* Save success message */}
          {store.saveSuccess && (
            <div className="mt-4 p-3 bg-green-100 text-green-700 rounded">
              <div className="font-semibold mb-2">{store.saveSuccess.message}</div>
              <div className="text-sm">
                <div>Timestamp: {new Date(store.saveSuccess.timestamp).toLocaleString()}</div>
                <details className="mt-2">
                  <summary className="cursor-pointer hover:underline">View Save Details</summary>
                  <pre className="mt-2 p-2 bg-green-50 rounded text-xs overflow-auto max-h-40">
                    {JSON.stringify(store.saveSuccess.details, null, 2)}
                  </pre>
                </details>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
})

export default DBTool