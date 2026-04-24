import React from 'react'
import NavBar from '../features/navbars/Navbar';
import { Outlet } from 'react-router';
import VideoModule from '../features/videoPlayer/VideoModule'

const Layout = () => {
  return (
    <section className="layout">
        <NavBar></NavBar>
        <div className='layout__content'>
          <Outlet />
        </div>

        <VideoModule/>
    </section>
  )
}

export default Layout