import React from 'react'
import VideoList from './VideoList'

const CameraAssignedItem = ({
  camera
}) => {

  const { id, cameraName, videos } = camera

  return (
    <section className='camera-item'>
      <h2 className="camera-item__h2">{cameraName}</h2>
      <VideoList
        id
        videos
      />
    </section>
  )
}

export default CameraAssignedItem