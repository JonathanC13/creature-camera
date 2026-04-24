import React from 'react'
import { NavLink } from "react-router-dom"
import CameraList from '../cameras/CameraList'

const adminHome = () => {

  return (
    <section className='admin-home'>
        <h1 className='admin-home__h1'>Admin home</h1>
        <NavLink 
            to="/users"
            className="admin-home__nav-link"
            >
            Manage users
        </NavLink>
        <NavLink 
            to="/cameras"
            className="admin-home__nav-link"
            >
            Manage cameras
        </NavLink>

        <CameraList></CameraList>
    </section>
  )
}

export default adminHome