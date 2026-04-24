import React from 'react'
import { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { videoParamsSet } from './videoSlice'

const videoModule = () => {
  const dispatch = useDispatch()

  // store
  const { videoParams: { id, filename, src }, hidden } = useSelector(state => state.video) 

  const [error, setError] = useState(false);

  const closeOnClickHandler = (e) => {
    dispatch(videoClosed())
  }

  return (
    <section className='video-module'>
      <button className="video-module__close-btn" onClick={closeOnClickHandler}>X</button>
      <h1>{filename}</h1>

      {error && <p className='video-module__error'>Video not available</p>}
      <video
        controls
        onError={() => setError(true)}
        className='video-module__video'
      >
        <source src={src} type="video/avi"/>
      </video>

    </section>
  )
}

export default videoModule