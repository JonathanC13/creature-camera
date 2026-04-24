import React from 'react'
import CameraItem from './CameraItem'
import { useGetSubVideosQuery } from './videosApiSlice'

const createCameraItemComps = (data) => {
  return data.map((e) => {
    return <CameraItem 
      camera={e}
    />
  })
}

const CameraList = () => {

    const {data, refetch, isFetching, isLoading, isError} = useGetSubVideosQuery(undefined, {
      pollingInterval: 600000,  // 10 minutes
    })

  return (
    <section className='camera-list'>
      <h1 className='camera-list__h1'>Cameras assigned</h1>

      <button onClick={refetch} disabled={isFetching}>
        {isFetching ? 'Refreshing...' : 'Refresh Data'}
      </button>

      {(isLoading || isFetching) && 
        <div className={(isLoading || isFetching) ? "loading__div" : "offscreen"}>
          {
              (isLoading || isFetching) ? 
              <div className="loader"></div> :
              <></>
          }
        </div>
      }

      <ul className='camera-list__ul'>
        {createCameraItemComps(data)}
      </ul>
    </section>
  )
}

export default CameraList
