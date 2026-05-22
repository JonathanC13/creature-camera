import React from 'react'
import { memo } from 'react'
import { useDispatch } from 'react-redux'
import { openModal } from "../modals/modalSlice"

const descriptionItem = (tag, info) => {
  return <li className="video-item__li">
    <p className='video-item__li__label-p'>{tag}:</p>
    <p className='video-item__li__info-p'>{info}</p>
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
    // console.log('rerender: ', filename)
    const dispatch = useDispatch()
    
    const baseURL = import.meta.env.VITE_BACKEND_BASE_URL
    const apiURL = import.meta.env.VITE_BACKEND_API_URL

    const f_length_s = Math.round(length_s, 2)
    const uploadDate = (new Date(birthtime)).toString()

    const thumbnailOnClickHandler = (e) => {
      dispatch(openModal({ type: "videoPlayer", 
        props: { 
          filename: filename,
          url: apiURL + 'videoSrc' + `?id=${cameraId}&filename=${filename}`
        }})
      )
    }

  return (
    <li className='video-item'>
      <section className="video-item__section cursor_pointer" onClick={thumbnailOnClickHandler}>
        <h3 className='video-item__section__h2'>{filename}</h3>
        <img src={baseURL + thumbnail} alt={filename} className="video-item__section__img"/>
        <ul className='video-item__ul'>
          {descriptionItem('upload time', uploadDate)}
          {descriptionItem('length (seconds)', f_length_s === 0 ? 'Could not retrieve length' : f_length_s)}
          {descriptionItem('size (KB)', size)}
        </ul>
      </section>
    </li>
  )
})

export default VideoItem