import React from 'react'
import Navbar from '../features/navbar/Navbar'
import { Outlet } from 'react-router';

const Layout = () => {
  return (
    <section className="layout">
        <Navbar></Navbar>
        <div className='layout__content'>
          <Outlet />
        </div>
    </section>
  )
}

export default Layout