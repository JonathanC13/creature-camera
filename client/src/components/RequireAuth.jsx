import { useEffect } from 'react'
import { useLocation, Navigate, Outlet } from 'react-router'
import { useSelector } from 'react-redux'
import { useLogoutMutation } from '../features/auth/authApiSlice'
import { ROLES } from '../constants/roles'

const RequireAuth = () => {
    const location = useLocation()
    // get from store the auth info.
    const auth = useSelector(state => state.auth)
    
    return (
        auth.userInfo?.token === undefined || Boolean(auth.userInfo?.temp_password) ? <Navigate to='/login' state={{ from: location }} replace></Navigate>
            : <Outlet/>
    )
}

export default RequireAuth