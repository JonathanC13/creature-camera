import React from 'react'
import { useState, useRef } from 'react'
import { useNavigate } from 'react-router'
import { useSelector } from 'react-redux'

import { selectRoleById } from '../roles/roleApiSlice'
import { useRegisterMutation } from './userApiSlice'
import FormInput from '../../components/FormInput'
import RoleDropDown from '../../components/RoleDropDown'

const register = () => {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [roleId, setRoleId] = useState('')
    const [msg, setMsg] = useStat('')

    const emailRef = useRef()
    const msgRef = useRef()

    const { data: roleData, } = useGetRolesQuery()
    const [register, {data, error, isLoading}] = useRegisterMutation()

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
            const roleInfo = useSelector((state) => selectRoleById(state, roleId));
            if (!roleInfo) {
                setMsg('Role error')
                return
            }

            const payload = {
                name,
                email,
                roleId: roleInfo.id,
                roleLevel: roleInfo.roleLevel,
                roleName: roleInfo.roleName
            }

            const response = await logIn(payload).unwrap()
                .then((res) => {
                    const successMsg = `Registerd. Notify user that an email to ${email} was sent with first time password.`
                    // clear form
                    resetControlledInputs()
                    setMsg(successMsg)
                    msgRef.current.focus()
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

  return (
    <section className="register">
        <form onSubmit={registerFormSubmitHandler} className="regiser__form">
            <h1>Register user</h1>
            <FormInput
                ref = {null}
                required = {true}
                text = 'name'
                inputType = 'text'
                value = {name}
                onChangeCB = {setName}>
            </FormInput>
            <FormInput
                ref = {emailRef}
                required = {true}
                text = 'email'
                inputType = 'text'
                value = {email}
                onChangeCB = {setEmail}>
            </FormInput>
            <RoleDropDown
                value={roleId}
                setRoleIdCB={setRoleId}
            ></RoleDropDown>
            <button type='submit' disabled={isLoading}>register</button>
            <p ref={msgRef}>{msg}</p>
            <div className={isLoading ? "loading__div" : "offscreen"}>
                {
                    isLoading ? 
                    <div className="loader"></div> :
                    <></>
                }
            </div>
        </form>
    </section>
  )
}

export default register