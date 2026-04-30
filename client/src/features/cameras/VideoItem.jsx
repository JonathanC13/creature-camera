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
      length,
      thumbnail
    } = videoInfo

    const dispatch = useDispatch()

    const thumbnailOnClickHandler = (e) => {
      dispatch(openModal({ type: "videoPlayer", 
        props: { 
          filename: filename,
          url: import.meta.env.VITE_BACKEND_URL + 'video/src/' + `?id=${cameraId}&filename=${filename}`
        }})
      )
    }

  return (
    <li className='video-item'>
      <section className="video-item__section">
        <h3 className='video-item__section__h2'>{filename}</h3>
        <img src={thumbnail} alt={filename} className="video-item__section__img" onclick={thumbnailOnClickHandler}/>
        <ul className='video-item__ul'>
          {descriptionItem('upload time', birthtime)}
          {descriptionItem('length', length)}
          {descriptionItem('size', size)}
        </ul>
      </section>
    </li>
  )
})

export default VideoItem