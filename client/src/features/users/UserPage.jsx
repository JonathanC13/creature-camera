import React from 'react'
import { useState, useRef, useEffect } from 'react'
import { useLogoutMutation } from '../auth/authApiSlice'
import { loggedOut } from '../auth/authSlice'
import { useGetUserQuery, useUpdateUserMutation, useDeleteUserMutation } from './userApiSlice'
import { userInfoSet } from '../auth/authSlice'
import { useGetRolesQuery, selectRoleById } from '../roles/roleApiSlice'
import { useNavigate, NavLink, useParams } from "react-router"
import { useSelector, useDispatch } from 'react-redux'
import FormInput from '../../components/FormInput'
import RoleDropDown from '../../components/RoleDropDown'
import { openModal } from '../modals/modalSlice'
import { ROLES } from '../../constants/roles'

const UserPage = () => {
    const { id } = useParams(); // id will be '123' if the URL is /user/123

    const dispatch = useDispatch()

    const navigate = useNavigate()

    const auth = useSelector(state => state.auth)
    const { data, isLoading, isError, refetch } = useGetUserQuery(id)
    const { data: dataRoles } = useGetRolesQuery()
    const [updateUser, {isLoading: isLoadingUpdate, isError: isErrorUpdate}] = useUpdateUserMutation()
    const [deleteUser, {isLoading: isLoadingDelete, isError: isErrorDelete}] = useDeleteUserMutation()
    const [logOut, {}] = useLogoutMutation()
    
    const isErrorGen = isErrorUpdate || isErrorDelete
    const modifyLoading = isLoadingUpdate || isLoadingDelete

    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [roleIdOrg, setRoleIdOrg] = useState('')
    const [roleId, setRoleId] = useState('')
    const [role, setRole] = useState('')
    const [editing, setEditing] = useState(false)
    const [msg, setMsg] = useState('')
    const roleOrgInfo = useSelector((state) => selectRoleById(state, roleIdOrg))
    const roleInfo = useSelector((state) => selectRoleById(state, roleId))
    
    const msgRef = useRef()

    const self = auth.userInfo.id === id
    const otherAdmin = (id !== auth.userInfo.id && roleOrgInfo?.roleName === ROLES.ADMIN)

    useEffect(() => {
      resetInfo()
    }, [data])

    const resetInfo = () => {
        if (data?.response) {
          setName(data?.response.name)
          setEmail(data?.response.email)
          setRoleIdOrg(data?.response.role_id)
          setRoleId(data?.response.role_id)
        }
    }

    const editOnClick = () => {
      setEditing(true)
    }

    const cancelEditOnClick = () => {
      setEditing(false)
      resetInfo()
    }

    const updateOnClick = async(e) => {
      e.preventDefault()
      const form = e.currentTarget
      setMsg('')

      try {
        const payload = {
          id: id,
          userInfo: {
            name,
            email,
            role_id: roleId,
            roleLevel: roleInfo.roleLevel,
            roleName: roleInfo.roleName
          }
        }

        const response = await updateUser(payload).unwrap()
          .then((res) => {
            if (id === auth.userInfo.id) {
              dispatch(userInfoSet(res.response))
            }
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
      if (self) {
        await logOut()
        dispatch(loggedOut())
        navigate("/", { replace: true })
      } else {
        navigate("/users", { replace: true }) // { replace: true } so cannot go back to this page.
      }
    }

    const onSubmitHandler = (e) => {
      e.preventDefault()
    }

    const editOptions = 
      <section className="user-edit-options">
        <div className="user-edit-options__editing-div">
        {editing ? 
            <>
              <button className="user-edit-options__editing-div__cancel-btn cursor_pointer" onClick={cancelEditOnClick}>cancel</button>
              <button className="user-edit-options__editing-div__update-btn cursor_pointer" onClick={updateOnClick}>update</button>
            </>
            : <button className="user-edit-options__editing-div__edit-btn cursor_pointer" onClick={editOnClick}>edit</button>
          
        }
        </div>

        <button className='user-edit-options__assign-cameras-btn cursor_pointer' onClick={openAssignCamerasModal}>assign cameras</button>

        <button className='user-edit-options__del-btn cursor_pointer' onClick={userDeleteOnClick}>delete</button>
      </section>

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
        <form className='user-page__form' onSubmit={onSubmitHandler}>
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
            disabled = {!editing || self}
          ></RoleDropDown>
          {self ? <p>Changing self role restricted.</p> : <></>}

          {otherAdmin 
            ? <p className="user-page__form__editing-restricted-p">Editing other Admin is restricted.</p> 
            : editOptions
          }

          <p className={isErrorGen ? 'update-user__p-error' : 'update-user__p-succ'} ref={msgRef}>{msg}</p>

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