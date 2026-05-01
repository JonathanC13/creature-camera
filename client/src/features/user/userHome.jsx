import React from 'react'
import CameraAssignedList from '../cameras/CameraAssignedList'
import { useSelector } from 'react-redux'

const userHome = () => {
  const auth = useSelector((state) => state.auth)
    // get user's subbed cameras
    // call CamerasSub to build component to display on userHome

  return (
    <section className='user-home'>
      <h1 className='user-home__h1'>User home</h1>
      <CameraAssignedList></CameraAssignedList>
    </section>
  )
}

export default userHome