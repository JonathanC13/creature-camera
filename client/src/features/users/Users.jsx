import React from 'react'
import { useState } from 'react'
import { useDispatch } from 'react-redux'
import RegisterUserModel from './RegisterUserModal'
import UsersTable from './UsersTable'

const Users = () => {
    const dispatch = useDispatch()

    const openRegisterModel = () => {
        dispatch(openModal({ type: "registerUser", }))
    }

  return (
    <section className='users'>

        <h1 className="users__h1">Users</h1>
        <button className="users__register-btn" onClick={openRegisterModel}>register</button>

        <UsersTable></UsersTable>
    </section>
  )
}

export default Users