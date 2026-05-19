import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { NavLink, useNavigate } from 'react-router'
import { ROLE_PATHS } from '../../constants/roles'
import LogoutBtn from '../auth/LogoutBtn'

const navbarItemComp = (id, text, link) => {
    return (
        <NavLink
            key={id}
            className='navbar__nav-link'
            to={link}
        >{text}</NavLink>
    )
}

const Navbar = () => {
    const dispatch = useDispatch()
    const navigate = useNavigate()

    const { id, roleName, temp_password} = useSelector((state) => state.auth.userInfo)

    let content = ''
    if (!roleName || temp_password) {
        content = <></>
    } else {
        content =
            <div className="navbar__right-div">
                {Object.entries(ROLE_PATHS[roleName]).map((e) => navbarItemComp(e[1].id, e[1].text, e[1].link))}
                {<LogoutBtn></LogoutBtn>}
            </div>
    }

  return (
    <section className='navbar'>
        <div className="navbar__left-div">
            <NavLink
                key={0}
                className='navbar__nav-link navbar-home'
                to={'/'}
            >Creature Camera</NavLink>
        </div>
        
        {content}
    </section>
  )
}

export default Navbar