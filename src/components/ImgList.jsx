import { useState, useEffect } from 'react'
import { observer } from 'mobx-react-lite'
import { ImageList } from '../store/imglist'

const ImgList = observer(({ list = {} }) => {
  const [store, setStore] = useState(null)

  useEffect(() => {
    // Create a new instance of ImageList store when the component mounts
    const imgListStore = new ImageList(list)
    setStore(imgListStore)

    // Clean up the store when the component unmounts
    return () => {
      imgListStore.dispose()
    }
  }, [JSON.stringify(list)]) // Re-create store when list or dbName changes

  // Don't render anything until store is initialized
  if (!store) {
    return (
      <div className="flex justify-center items-center h-40">
        <p className="text-gray-500">Initializing...</p>
      </div>
    )
  }

  return (
    <>
      <div className="p-4">
        {store.isLoading ? (
          <div className="flex justify-center items-center h-40">
            <p className="text-gray-500">Loading images...</p>
          </div>
        ) : store.isEmpty ? (
          <div className="flex justify-center items-center h-40">
            <p className="text-gray-500">No images found</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {store.images.map((img) => (
              <a key={img.id} href={store.getLink(img)} target={store.listParams.isNewTab ? '_blank' : ''}>
              <div className="overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <img
                  src={store.getSrc(img)}
                  alt={img.name || `Image ${img.id}`}
                  className="w-full h-auto object-cover"
                  loading="lazy"
                />
                <div className="p-2 bg-white">
                  <p className="text-sm font-medium truncate">{img.name || `Image ${img.id}`}</p>
                  {img.score && <p className="text-xs text-gray-500">Rate: {img.score}</p>}
                </div>
              </div>
              </a>
            ))}
          </div>
        )}
        
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-500">Total images: {store.count}</p>
        </div>
      </div>
    </>
  )
})

export default ImgList
