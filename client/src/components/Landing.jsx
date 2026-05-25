import React from 'react'
import Navbar from '../features/navbar/Navbar'
import { Outlet } from 'react-router';

const Landing = () => {
  return (
    <section className="landing">
        <div className="landing-banner__div">
            <h1 className="landing__h1">Creature Camera</h1>
        </div>
        <div className='layout__content'>
          <Outlet />
        </div>
    </section>
  )
}

export default Landing