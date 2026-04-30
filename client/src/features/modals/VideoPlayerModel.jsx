import React from 'react'
import { useState } from 'react'
// import { useDispatch } from 'react-redux'

const VideoPlayerModel = ({
  filename,
  url
}) => {
  // const dispatch = useDispatch()

  const [error, setError] = useState(false);

  return (
    <section className='video-module'>
      <h1>{filename}</h1>

      {error && <p className='video-module__error'>Video not available</p>}
      <video
        controls
        onError={() => setError(true)}
        className='video-module__video'
      >
        <source src={url} type="video/avi"/>
      </video>

    </section>
  )
}

export default VideoPlayerModel