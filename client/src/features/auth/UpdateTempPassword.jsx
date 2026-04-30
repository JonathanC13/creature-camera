import React from 'react'
import { useState, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router'
import FormInput from '../../components/FormInput'
import ShowPasswordBtn from '../../components/ShowPasswordBtn'
import { useUpdatePasswordMutation } from './authApiSlice'
import { loggedOut } from './authSlice'

const UpdateTempPassword = ({
    otp,
    forgot = false
}) => {
    const dispatch = useDispatch()
    const navigate = useNavigate()

    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showConfirm, setShowConfirm] = useState(false)
    const [msg, setMsg] = useState('')

    const msgRef = useRef()

    const [updatePassword, { isLoading }] = useUpdatePasswordMutation()

    const updatePasswordOnClick = async(e) => {
        e.preventDefault()
        const form = e.currentTarget
        setMsg('')

        if (password !== confirmPassword) {
            setMsg('new password and confirm password do not match.')
            msgRef.current.focus()
            return
        }

        try {
            const payload = {
                currentPassword: otp,
                newPassword: password
            }
            // state.auth has info for request; userInfo {id, temp_password}, token
            const resp = await updatePassword(payload).unwrap()
                .then((res) => {
                    if (forgot) {
                        // from forgot password, make user log in with new password.
                        dispatch(loggedOut())
                        navigate("/login", { replace: true })
                    } else {
                        // from first time log in and forced to change password, since already authenticated continue to home
                        navigate("/", { replace: true })
                    }
                })
                .catch((error) => {
                    // console.log(error)
                    if (!error.data) {
                        setMsg('no server response.')
                    } else if (error?.data?.message) {
                        const message = error?.data?.message ?? 'error.'
                        setMsg(message)
                    } else {
                        setMsg('update password failed.')
                    }
                    msgRef.current.focus()
                })
        } catch(e) {
            setMsg('update password failed.')
            msgRef.current.focus()
        }
    }

  return (
    <form action="javascript:void(0)" className="update-temp-pass__OTP-form" onSubmit={updatePasswordOnClick}>
        <h1 className="update-temp-pass__OTP-form__h1">enter new password</h1>
        <div className="update-temp-pass__OTP-form__div">
            <FormInput
                ref = {null}
                required = {true}
                text = 'new password'
                inputType = {showPassword ? 'text' : 'password'}
                value = {password}
                onChangeCB = {setPassword}
                disabled = {isLoading ? true : false}
            >
            </FormInput>
            <ShowPasswordBtn
                showPassword={showPassword}
                setShowPasswordCB={setShowPassword}
            ></ShowPasswordBtn>
        </div>
        <div className="update-temp-pass__OTP-form__div">
            <FormInput
                ref = {null}
                required = {true}
                text = 'confirm password'
                inputType = {showConfirm ? 'text' : 'password'}
                value = {confirmPassword}
                onChangeCB = {setConfirmPassword}
                disabled = {isLoading ? true : false}
            >
            </FormInput>
            <ShowPasswordBtn
                showPassword={showConfirm}
                setShowPasswordCB={setShowConfirm}
            ></ShowPasswordBtn>
        </div>

        <button type='submit'>update password</button>
        <p ref={msgRef}>{msg}</p>
        <div className={isLoading ? "loading__div" : "offscreen"}>
            {
                isLoading ? 
                <div className="loader"></div> :
                <></>
            }
        </div>
    </form>
  )
}

export default UpdateTempPassword