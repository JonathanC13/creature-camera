import React from 'react'
import { ROLES } from '../constants/roles'
import { useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom'

const DashboardRedirect = () => {
    const roleStrings = Object.entries(ROLES).map((e) => e[1])
    const auth = useSelector((state) => state.auth)
    
    const validAuth = auth.userInfo?.token !== undefined && auth.userInfo?.roleName !== undefined && roleStrings.find((e) => e === auth.userInfo?.roleName) !== undefined
    // show the children if user exists, else go to login page.

  return (
    validAuth ? <Navigate to={auth.userInfo.roleName === "admin" ? "/admin" : "/user"} replace /> 
        : <Navigate to='/login' replace></Navigate>
  )
}

export default DashboardRedirect