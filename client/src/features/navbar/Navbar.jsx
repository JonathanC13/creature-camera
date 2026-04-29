import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { NavLink, useNavigate } from 'react-router'
import { ROLE_PATHS } from '../../constants/roles'
import { loggedOut } from '../auth/authSlice'
import { useLogoutMutation } from '../auth/authApiSlice'

const navbarItemComp = (text, link) => {
    return (
        <NavLink
            to={link}
            style={({ isActive }) => ({
                color: isActive ? "orange" : "white",
                textDecoration: "none",
            })}
        >{text}</NavLink>
    )
}

const Navbar = () => {
    const dispatch = useDispatch()
    const navigate = useNavigate()

    const roleName = useSelector((state) => state.auth.user?.roleName)
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
    <section className='navbar'>
        <div className="navbar__left-div">
            {navbarItemComp('Creature Camera', '/')}
        </div>
        
        <div className="navbar__right-div">
            {Object.entries(ROLE_PATHS).map((e) => navbarItemComp(e.text, e.link))}
            <button className="navbar__logout-btn" onClick={logOutOnClick}>log out</button>
        </div>
    </section>
  )
}

export default Navbar