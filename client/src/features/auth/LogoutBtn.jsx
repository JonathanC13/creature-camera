import React from 'react'
import { useDispatch } from 'react-redux'
import { loggedOut } from './authSlice'
import { useLogoutMutation } from './authApiSlice'
import { useNavigate } from 'react-router-dom'

const LogoutBtn = () => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    
    const [logout, {}] = useLogoutMutation()

    const logOutOnClick = async() => {
        try {
            const resp = await logout()
        } catch(e) {
        } finally {
            dispatch(loggedOut())
            navigate("/login", { replace: true });
        }
    }

  return (
    <button key={-1} className="logout-btn cursor_pointer" onClick={logOutOnClick}>log out</button>
  )
}

export default LogoutBtn