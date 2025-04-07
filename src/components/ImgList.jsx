import { useState, useEffect } from 'react'
import { observer } from 'mobx-react-lite'
import { useParams } from 'react-router-dom'
import { ImageList } from '../store/imglist'

const ImgList = observer(({ list = {} }) => {
  const routeParams = useParams(); // Get route parameters
  const [store, setStore] = useState(null);

  useEffect(() => {
    const imgListStore = new ImageList(list, routeParams);    
    setStore(imgListStore);

    return () => {
      imgListStore.dispose();
    };
  }, [JSON.stringify(list), JSON.stringify(routeParams)]);

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
      <div className="">
        {store.isLoading ? (
          <div className="flex justify-center items-center h-40">
            <p className="text-gray-500">Loading images...</p>
          </div>
        ) : store.isEmpty ? (
          <div className="flex justify-center items-center h-40">
            <p className="text-gray-500">No images found</p>
          </div>
        ) : (
          <div className="flex flex-wrap">
            {store.images.map((img) => {
              // Calculate width percentage based on columns
              const widthPercent = store.listParams.cols ? `${100 / store.listParams.cols}%` : '50%';
              const style = { width: '100%' }
              if (store.listParams.ratio) style.aspectRatio = store.listParams.ratio

              return (
                <a
                  key={img.id}
                  href={store.getLink(img)}
                  target={store.listParams.isNewTab ? '_blank' : ''}
                  style={{ width: widthPercent }}
                  className="block transition-transform duration-100 hover:scale-125"
                >
                  <div className="shadow-md hover:shadow-lg transition-shadow h-full">
                    <img
                      src={store.getSrc(img)}
                      alt={img.name || `Image ${img.id}`}
                      title={store.getTitle(img)}
                      className="h-auto object-contain"
                      style={style}
                      loading="lazy"
                    />
                  </div>
                </a>
              );
            })}
          </div>
        )}
        
        <div className="text-center">
          <p className="text-sm text-gray-500">Total images: {store.count}</p>
        </div>
      </div>
    </>
  )
})

export default ImgList
