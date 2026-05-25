import React from 'react'
import { useState, useEffect, useRef } from 'react'
// import { useDispatch } from 'react-redux'

const VideoPlayerModel = ({
  filename,
  url
}) => {
  // console.log(url)
  // const dispatch = useDispatch()
  const [error, setError] = useState(false);
  const videoRef = useRef(null);

  const handleError = () => {
    setError(true)
    const video = videoRef.current;
    console.log(video)
    console.log(video.error);

    switch (video.error?.code) {
      case MediaError.MEDIA_ERR_ABORTED:
        console.log('Playback aborted');
        break;

      case MediaError.MEDIA_ERR_NETWORK:
        console.log('Network error');
        break;

      case MediaError.MEDIA_ERR_DECODE:
        console.log('Decode error');
        break;

      case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
        console.log('Format not supported');
        break;

      default:
        console.log('Unknown error');
    }
  };

  return (
    <section className='video-module'>
      <h1 className='video-module__h1'>{filename}</h1>

      {error && <p className='video-module__error'>Video not available</p>}
      {/* <video controls onError={handleError} src='http://localhost:5000/video/recorded_202658_14h32m51s.mp4' /> */}
      <video
        ref={videoRef}
        controls
        onError={handleError}
        className='video-module__video'
        // width="640"
      >
        <source src={url} type="video/mp4"/>
      </video>

    </section>
  )
}

export default VideoPlayerModel