import { useLocation, Navigate, Outlet } from 'react-router'
import { useSelector } from 'react-redux'
import { useLogoutMutation } from '../features/auth/authApiSlice'
import { ROLES } from '../constants/roles'

const RequireAuth = () => {
    // const location = useLocation()
    // get from store the auth info.
    const auth = useSelector(state => state.auth)

    const [logOut, {isLoadingLogOut}] = useLogoutMutation()
    const logOutHandler = async() => {
        try {
            const response = await logOut().unwrap()
                .then((payload) => {
                })
                .catch((error) => {
                })
        } catch (err) {
        } finally {
            <Navigate to='/login' replace></Navigate>
        }
    }

    useEffect(() => {
        if (!auth.userInfo.roleName) {
            logOutHandler()
        }
    }, [])
    // show the children if user exists, else go to login page.
    return (
        !auth?.token || auth.user?.temp_password ? <Navigate to='/login' replace></Navigate>
            : ROLES.hasOwn(auth.userInfo.roleName) ? <Navigate to={auth.userInfo.roleName === "admin" ? "/admin" : "/user"} replace />
                    : <Navigate to='/login' replace></Navigate>
             
            
    )
}

export default RequireAuth