import React from 'react'
import { useState, useRef } from 'react'
import { useGetUserQuery, useUpdateUserMutation, useDeleteUserMutation } from './userApiSlice'
import { selectRoleById } from '../roles/roleApiSlice'
import { useNavigate, NavLink, useParams } from "react-router"
import { useSelector } from 'react-redux'
import FormInput from '../../components/FormInput'
import RoleDropDown from '../../components/RoleDropDown'
import { openModal } from '../modals/modalSlice'

const UserPage = () => {
    const { id } = useParams(); // id will be '123' if the URL is /user/123

    const navigate = useNavigate()

    const { data, isLoading, isError, refetch } = useGetUserQuery(id)
    const { data: dataRoles } = useGetRolesQuery()
    const [updateUser, {isLoading: isLoadingUpdate}] = useUpdateUserMutation()
    const [deleteUser, {isLoading: isLoadingDelete}] = useDeleteUserMutation()

    const modifyLoading = isLoadingUpdate || isLoadingDelete

    const [name, setName] = useState(data.name ?? '')
    const [email, setEmail] = useState(data.email ?? '')
    const [roleId, setRoleId] = useState(data.roleId ?? '')
    const [editing, setEditing] = useState(false)
    const [msg, setMsg] = useState('')

    const msgRef = useRef()

    const editOnClick = () => {
      setEditing(true)
    }

    const cancelEditOnClick = () => {
      setEditing(false)
      refetch()
    }

    const updateOnClick = async(e) => {
      e.preventDefault()
      const form = e.currentTarget
      setMsg('')

      try {
        const role = useSelector((state) => selectRoleById(state, roleId))
        const payload = {
          name,
          email,
          roleId,
          roleLevel: role.roleLevel,
          roleName: role.roleName
        }

        const response = await updateUser(payload).unwrap()
          .then((res) => {
              setMsg('user updated.')
          })
          .catch((error) => {
              // console.log(error)
              if (!error.data) {
                  setMsg('no server response.')
              } else if (error?.data?.message) {
                  const message = error?.data?.message ?? 'error.'
                  setMsg(message)
              } else {
                  setMsg('update failed.')
              }
              msgRef.current.focus()
            })
      } catch (e) {
        setMsg('update failed.')
        msgRef.current.focus()
      }
    }

    const openAssignCamerasModal = () => {
      dispatch(openModal({ type: "assignCameras", props: {
        id: data.id
      }}))
    }

    const userDeleteOnClick = async(e) => {
      await deleteUser(id)
      navigate("/users", { replace: true }) // { replace: true } so cannot go back to this page.
    }

    let content = ''
    if (isError) {
      content = <p>Error</p>
    } else if (isLoading) {
      content = 
        <div className={(isLoading) ? "loading__div" : "offscreen"}>
          {
              (isLoading) ? 
              <div className="loader"></div> :
              <></>
          }
        </div>
    } else {
      content =
        <form className='user-page__form' action='javascript:void(0)'>
          <FormInput
            ref = {null}
            required = {true}
            text = 'name'
            inputType = 'text'
            value = {name}
            onChangeCB = {setName}
            disabled = {!editing}
          ></FormInput>
          <FormInput
            ref = {null}
            required = {true}
            text = 'email'
            inputType = 'text'
            value = {email}
            onChangeCB = {setEmail}
            disabled = {!editing}
          ></FormInput>

          <RoleDropDown 
            roleId = {roleId}
            setRoleIdCB = {setRoleId}
            disabled = {!editing}
          ></RoleDropDown>

          <div className="user-page__form__editing-div">
          {editing ? 
            <>
              <button className="user-page__form__editing-div__cancel-btn" onClick={cancelEditOnClick}>cancel</button>
              <button className="user-page__form__editing-div__update-btn" onClick={updateOnClick}>update</button>
            </>
            : <button className="user-page__form__editing-div__edit-btn" onClick={editOnClick}>edit</button>
          }
          </div>

          <button className='user-page__form__assign-cameras-btn' onClick={openAssignCamerasModal}>assign cameras</button>

          <button className='user-page__form__del-btn' onClick={userDeleteOnClick}>delete</button>

          <p ref={msgRef}>{msg}</p>

          {(modifyLoading) && 
            <div className={(modifyLoading) ? "loading__div" : "offscreen"}>
            {
                (modifyLoading) ? 
                <div className="loader"></div> :
                <></>
            }
            </div>
          }
        </form>
    }

  return (
    <section className='user-page'>
      <NavLink 
        to="/users" 
        className='user-page__navlink-back'
      >
        To all users
      </NavLink>

      <h1 className='user-page__h1'>User</h1>

      {content}

    </section>
  )
}

export default UserPage