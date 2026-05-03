import React from 'react'
import { useState, useRef } from 'react'
import { useNavigate } from 'react-router'
import { useDispatch, useSelector } from 'react-redux'

import { useGetRolesQuery, selectRoleById } from '../roles/roleApiSlice'
import { useRegisterMutation } from '../users/userApiSlice'
import FormInput from '../../components/FormInput'
import RoleDropDown from '../../components/RoleDropDown'

import { closeModal } from "./modalSlice";

const RegisterUserModal = ({ isOpen, onClose, defaultOpen = false }) => {
    const dispatch = useDispatch()

    const [internalOpen, setInternalOpen] = useState(defaultOpen)
    const isControlled = isOpen !== undefined
    const open = isControlled ? isOpen : internalOpen

    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [roleId, setRoleId] = useState('')
    const [msg, setMsg] = useState('')
    const roleInfo = useSelector((state) => selectRoleById(state, roleId));
    
    const emailRef = useRef()
    const msgRef = useRef()

    const { data: roleData, } = useGetRolesQuery()
    const [register, {data, error, isError, isLoading}] = useRegisterMutation()

    const close = () => {
        if (isControlled) onClose?.();
        else setInternalOpen(false);
    };

    const resetControlledInputs = () => {
        setName('')
        setEmail('')
        setRoleId('')
    }

    // event handler
    const registerFormSubmitHandler = async(e) => {
        e.preventDefault()
        const form = e.currentTarget
        setMsg('')

        try {
            if (!roleInfo) {
                setMsg('Role error')
                return
            }

            const payload = {
                name,
                email,
                role_id: roleInfo.id,
                roleLevel: roleInfo.roleLevel,
                roleName: roleInfo.roleName
            }

            const response = await register(payload).unwrap()
                .then((res) => {
                    const successMsg = `Registerd. Notify user that an email to ${email} was sent with first time password.`
                    // clear form
                    resetControlledInputs()
                    setMsg(successMsg)
                    msgRef.current.focus()
                    dispatch(closeModal())
                })
                .catch((error) => {
                    // console.log(error)
                    if (!error.data) {
                        setMsg('no server response.')
                    } else if (error?.data?.message) {
                        const message = error?.data?.message ?? 'error.'
                        setMsg(message)
                    } else {
                        setMsg('register failed.')
                    }
                    msgRef.current.focus()
                })
        } catch (e) {
            setMsg('register failed.')
            msgRef.current.focus()
        }
    }

  return open ? (
    <section className="register">
        <form onSubmit={registerFormSubmitHandler} className="regiser__form">
            <h1 className='register__form__h1'>Register user</h1>
            <FormInput
                ref = {null}
                required = {true}
                text = 'name'
                inputType = 'text'
                value = {name}
                onChangeCB = {setName}
                inputId = 'register-user-name'
                >
            </FormInput>
            <FormInput
                ref = {emailRef}
                required = {true}
                text = 'email'
                inputType = 'text'
                value = {email}
                onChangeCB = {setEmail}
                inputId = 'register-user-email'
                >
            </FormInput>
            <RoleDropDown
                roleId={roleId}
                setRoleIdCB={setRoleId}
            ></RoleDropDown>
            <div className="register__form__div-btns">
                <button className='register__form__submit-btn cursor_pointer' type='submit' disabled={isLoading}>register</button>
            </div>
            <p className={isError ? 'register__form__p-error' : 'register__form__p-succ'} ref={msgRef}>{msg}</p>
            <div className={isLoading ? "loading__div" : "offscreen"}>
                {
                    isLoading ? 
                    <div className="loader"></div> :
                    <></>
                }
            </div>
        </form>
    </section>
  ) : null
}

export default RegisterUserModal