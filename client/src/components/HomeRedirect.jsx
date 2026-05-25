import React from 'react'
import { useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom'

const HomeRedirect = () => {
    const auth = useSelector((state) => state.auth)
  return (
    auth.userInfo?.token
        ? <Navigate to="/dashboard" replace />
        : <Navigate to="/login" replace />
  )
}

export default HomeRedirect