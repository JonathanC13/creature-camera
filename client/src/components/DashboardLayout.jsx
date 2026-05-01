import React from 'react'
import { Outlet } from 'react-router-dom'

const DashboardLayout = () => {
  console.log('dahsboard layout')
  return (
    <section className="dashboard-layout">
      <Outlet/>
    </section>
  )
}

export default DashboardLayout