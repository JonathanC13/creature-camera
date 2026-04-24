import React from 'react'
import CameraList from '../cameras/CameraList'

const userHome = () => {

    // get user's subbed cameras
    // call CamerasSub to build component to display on userHome

  return (
    <secition className='user-home'>
      <h1 className='user-home__h1'>User home</h1>
      <CameraList></CameraList>
    </secition>
  )
}

export default userHome