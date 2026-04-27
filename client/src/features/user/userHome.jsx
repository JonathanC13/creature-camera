import React from 'react'
import CameraAssignedList from '../cameras/CameraAssignedList'

const userHome = () => {

    // get user's subbed cameras
    // call CamerasSub to build component to display on userHome

  return (
    <secition className='user-home'>
      <h1 className='user-home__h1'>User home</h1>
      <CameraAssignedList></CameraAssignedList>
    </secition>
  )
}

export default userHome