import React from 'react'
import NavBar from '../features/navbars/Navbar';
import { Outlet } from 'react-router';

const Layout = () => {
  return (
    <section className="layout">
        <NavBar></NavBar>
        <div className='layout__content'>
          <Outlet />
        </div>
    </section>
  )
}

export default Layout