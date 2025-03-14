import React from 'react'
import { observer } from 'mobx-react-lite'
import { dbtool } from '../store/dbtool.js'

const DBTool = observer(() => {
  const handleDBChange = (e) => {
    dbtool.setSelectedDB(e.target.value)
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Database Tool</h1>
        <button
          onClick={dbtool.loadDatabases}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          disabled={dbtool.loading}
        >
          Refresh Databases
        </button>
      </div>
      
      {dbtool.loading && (
        <div className="mb-4 text-gray-600">Loading databases...</div>
      )}
      
      {dbtool.error && (
        <div className="mb-4 p-2 bg-red-100 text-red-800 rounded">
          {dbtool.error}
        </div>
      )}
      
      {!dbtool.loading && dbtool.databases.length > 0 && (
        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="database-select">
            Select Database:
          </label>
          <select
            id="database-select"
            className="w-full p-2 border border-gray-300 rounded"
            value={dbtool.selectedDB || ''}
            onChange={handleDBChange}
          >
            {dbtool.databases.map((db, index) => (
              <option key={index} value={db}>
                {db}
              </option>
            ))}
          </select>
        </div>
      )}
      
      {!dbtool.loading && dbtool.databases.length === 0 && !dbtool.error && (
        <div className="mb-4 p-2 bg-yellow-100 text-yellow-800 rounded">
          No databases found.
        </div>
      )}
      
      {dbtool.selectedDB && (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <h2 className="text-xl font-semibold mb-2">Selected Database: {dbtool.selectedDB}</h2>
          <p className="text-gray-700">
            Database information and operations could be displayed here.
          </p>
        </div>
      )}
    </div>
  )
})

export default DBTool