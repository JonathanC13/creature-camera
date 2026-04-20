import React from 'react'
import { Outlet, NavLink } from 'react-router'

const AuthLayout = () => {
  return (
    <section className='auth-layout'>
        <div className='auth-layout__content'>
          <ul className='auth-layout__content-ul'>
            <li className='auth-layout__content-li'><NavLink className='auth-layout__content-li-nav' to='/login' end>log in</NavLink></li>
            <li className='auth-layout__content-li'><NavLink className='auth-layout__content-li-nav' to='/register' end>register</NavLink></li>
          </ul>
          <Outlet></Outlet>
        </div>
    </section>
  )
}

export default AuthLayout