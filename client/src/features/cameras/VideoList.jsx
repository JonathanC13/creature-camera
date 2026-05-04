import React from 'react'
import { useState, useEffect } from 'react'
import VideoItem from './VideoItem'

const VideoList = ({
    cameraId,
    videosArr = []
}) => {
    // const sortCategory = localStorage.getItem(cameraId + '__cate')
    if (!localStorage.getItem(cameraId + '__sortDesc')) {
        localStorage.setItem(cameraId + '__sortDesc', true)
    }
    const sortDesc = localStorage.getItem(cameraId + '__sortDesc')

    const [videos, setVideos] = useState(videosArr)
    const [descUploadTime, setDescUploadTime] = useState(sortDesc ?? true)

    const toggleDescUploadTime = () => {
        setDescUploadTime(!descUploadTime)
    }

    useEffect(() => {

        // sort videos in original Array -> spread into new Array() so that setVideos state reference changed to new array, but the object reference within are the same as original which is one part to not re-render the item component.
        setVideos(prevVideos =>
            [...prevVideos].sort((a, b) => {
                if(descUploadTime) {
                    return b.birthtime - a.birthtime
                } else {
                    return -1
                }
            })
        );
    }, [descUploadTime])   // so on change of createdDesc, the re-render will use the updated state for the sorting.

    /* 
    1. Assigning videoComps to a variable does not inherently trigger re-renders.
    2. React.memo + stable key + unchanged item objects (see sort unchanged objects, but new Array to cause this comp to re-render) -> ListItem does not re-render when this component re-renders.
    3. Storing JSX in a variable is fine; the memoization works per element key + props reference, not per variable.

    could put directly in jsx return 
        {videos.map(video => (
            <VideoItem key={video.id} item={video} />))
        }
    */
    // Component re-renders due to videos state change to re-order memoized VideoItem
    const videoComps = videos.map(video => (
        <VideoItem key={video.filename} cameraId={cameraId} videoInfo={video} />
    ));
    
    // This component is to display the videoItems in a list and provide sorting.
    // If parent passes new object, like from re-fetch. it will re-render all items since new references === OK. Just don't want re-render of items when sorting

  return (
    <section className='video-list'>
        <div className="video-list__sort-opt-div">
            <p className="video-list__sort-opt-div__p">Sort</p>
            <button className="video-list__sort-opt-div__upload-btn">upload time {descUploadTime ? 'desc' : 'asc'}</button>
        </div>
        
        <ul className='video-list__ul'>
            {videoComps}
        </ul>
    </section>
  )
}

export default VideoList