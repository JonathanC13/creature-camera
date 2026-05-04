import React from 'react'
import CameraAssignedItem from './CameraAssignedItem'
import { useGetSubVideosQuery } from './videosApiSlice'

const createCameraItemComps = (data) => {
  return data.map((e) => 
    <CameraAssignedItem 
      key={e.id}
      camera={e}
    />
  )
}

const CameraList = () => {

    const {data, refetch, isFetching, isLoading, isError} = useGetSubVideosQuery(undefined, {
      pollingInterval: 600000,  // 10 minutes
    })
    const dataResp = data?.response ? data.response : []
    
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
        <ul className='camera-assigned__ul'>
          {dataResp.length === 0 
            ? <p className='camera-assigned__p'>No assigned cameras, request assignment with an admin.</p>
            : createCameraItemComps(dataResp)}
        </ul>
    }

  return (
    <section className='camera-assigned'>
      <h1 className='camera-assigned__h1'>Cameras assigned</h1>

      <button className='refetch-btn cursor_pointer' onClick={refetch} disabled={isFetching}>
        {isFetching ? 'Refreshing...' : 'Refresh Data'}
      </button>

      {content}
      
    </section>
  )
}

export default CameraList
