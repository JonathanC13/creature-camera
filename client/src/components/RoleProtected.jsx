import { Navigate, Outlet } from 'react-router'
import { useSelector } from 'react-redux'
import { ROLES } from '../constants/roles'

const RoleProtected = ({
    allowedRoles
}) => {
    // get from store the auth info.
    const auth = useSelector(state => state.auth)
    // Unauthorized user: redirect to their home
    // const redirectHome = auth.userInfo.roleName === ROLES.ADMIN ? "admin" : "user";
    // show the children if user exists, else go to login page.
    return (
        allowedRoles.includes(auth.userInfo?.roleName)
            ? <Outlet />
            : <Navigate to="/unauthorized" replace />
    )
}

export default RoleProtected