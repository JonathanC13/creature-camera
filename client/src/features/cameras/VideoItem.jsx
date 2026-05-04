import React from 'react'
import { memo } from 'react'
import { useDispatch } from 'react-redux'
import { openModal } from "../modals/modalSlice"

const descriptionItem = (tag, info) => {
  return <li className="video-item__li">
    {tag}: {info}
  </li>
}

const VideoItem = memo(({
  cameraId,
  videoInfo
}) => {
    const {
      filename,
      birthtime,
      size,
      length_s,
      thumbnail
    } = videoInfo
    
    const dispatch = useDispatch()

    const baseURL = import.meta.env.VITE_BACKEND_BASE_URL
    const apiURL = import.meta.env.VITE_BACKEND_API_URL

    const thumbnailOnClickHandler = (e) => {
      dispatch(openModal({ type: "videoPlayer", 
        props: { 
          filename: filename,
          url: apiURL + 'video/src/' + `?id=${cameraId}&filename=${filename}`
        }})
      )
    }

  return (
    <li className='video-item'>
      <section className="video-item__section cursor_pointer" onclick={thumbnailOnClickHandler}>
        <h3 className='video-item__section__h2'>{filename}</h3>
        <img src={baseURL + thumbnail} alt={filename} className="video-item__section__img"/>
        <ul className='video-item__ul'>
          {descriptionItem('upload time', birthtime)}
          {descriptionItem('length (seconds)', length_s === 0 ? 'Could not retrieve length' : length_s)}
          {descriptionItem('size', size)}
        </ul>
      </section>
    </li>
  )
})

export default VideoItem