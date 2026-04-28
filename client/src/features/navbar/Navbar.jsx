import React from 'react'
import { useDispatch } from 'react-redux'
import { NavLink, useNavigate } from 'react-router'
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

    const [logout, {}] = useLogoutMutation()

    const navItemsInfo = [['settings', '/settings']]

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
            <h1>Creature Camera</h1>
        </div>
        
        <div className="navbar__right-div">
            {navItemsInfo.map((e) => navbarItemComp(e[0], e[1]))}
            <button className="navbar__logout-btn" onClick={logOutOnClick}>log out</button>
        </div>
    </section>
  )
}

export default Navbar