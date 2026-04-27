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

    let content = ''
    if (isError) {
      content = <p>Error</p>
    } else if (isLoading) {
      content = 
        <div className={(isLoading) ? "loading__div" : "offscreen"}>
            {
                (isLoading) ? 
                <div className="loader"></div> :
                <></>
            }
          </div>
    } else {
      content =
        <ul className='camera-list__ul'>
          {createCameraItemComps(data)}
        </ul>
    }

  return (
    <section className='camera-list'>
      <VideoPlayerModel/>

      <h1 className='camera-list__h1'>Cameras assigned</h1>

      <button onClick={refetch} disabled={isFetching}>
        {isFetching ? 'Refreshing...' : 'Refresh Data'}
      </button>

      {content}
      
    </section>
  )
}

export default CameraList
