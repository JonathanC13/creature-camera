import React from 'react'
import CameraItem from './CameraItem'
import { useGetSubVideosQuery } from './videosApiSlice'
import VideoPlayerModel from '../modals/VideoPlayerModel'

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
      <VideoPlayerModel/>

      <h1 className='camera-list__h1'>Cameras assigned</h1>

      <button onClick={refetch} disabled={isFetching}>
        {isFetching ? 'Refreshing...' : 'Refresh Data'}
      </button>

      {(isLoading) && 
        <div className={(isLoading || isFetching) ? "loading__div" : "offscreen"}>
          {
              (isLoading) ? 
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
