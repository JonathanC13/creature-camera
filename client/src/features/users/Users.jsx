import React from 'react'
import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { openModal } from '../modals/modalSlice'
import UsersTable from './UsersTable'

const Users = () => {
    const dispatch = useDispatch()

    const openRegisterModel = () => {
      dispatch(openModal({ type: "registerUser", props: {isOpen: true}}))
    }

  return (
    <section className='users'>

        <h1 className="users__h1">Manage users</h1>
        <button className="users__register-btn cursor_pointer" onClick={openRegisterModel}>register new user</button>

        <UsersTable></UsersTable>
    </section>
  )
}

export default Users