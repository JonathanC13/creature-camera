import React from 'react'
import { useState, useEffect, useMemo } from 'react'
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

    const [descUploadTime, setDescUploadTime] = useState(sortDesc ?? true)

    const toggleDescUploadTime = () => {
        setDescUploadTime(!descUploadTime)
    }

    // sort videos in original Array -> spread into new Array() so that setVideos state reference changed to new array, but the object reference within are the same as original which is one part to not re-render the item component.
    const sortedVideos = useMemo(() => {
        return [...videosArr].sort((a, b) => 
            {
                if(descUploadTime) {
                    return new Date(b.birthtime) - new Date(a.birthtime)
                } else {
                    return new Date(a.birthtime) - new Date(b.birthtime)
                }
            })
    }, [videosArr, descUploadTime]);

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
    const videoComps = sortedVideos.map(video => (
        <VideoItem key={video.filename} cameraId={cameraId} videoInfo={video} />
    ));
    
    // This component is to display the videoItems in a list and provide sorting.
    // If parent passes new object, like from re-fetch. it will re-render all items since new references === OK. Just don't want re-render of items when sorting

  return (
    <section className='video-list'>
        <div className="video-list__sort-opt-div">
            {/* <p className="video-list__sort-opt-div__p">Sort</p> */}
            <button className="video-list__sort-upl-btn cursor_pointer" onClick={toggleDescUploadTime}>Sorted by upload time {descUploadTime ? 'desc' : 'asc'}</button>
        </div>
        <p className="video-list__count-p">Number of videos: {sortedVideos.length}</p>
        <ul className='video-list__ul'>
            {videoComps}
        </ul>
    </section>
  )
}

export default VideoList