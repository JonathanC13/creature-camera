import React from 'react'
import { useState, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router'
import FormInput from '../../components/FormInput'
import ShowPasswordBtn from '../../components/ShowPasswordBtn'
import { useUpdatePasswordMutation } from './authApiSlice'
import { userInfoSet, loggedOut } from './authSlice'

const UpdateTempPassword = ({
    otp,
    forgot = false
}) => {
    const dispatch = useDispatch()
    const navigate = useNavigate()

    const auth = useSelector((state) => state.auth)
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showConfirm, setShowConfirm] = useState(false)
    const [msg, setMsg] = useState('')

    const msgRef = useRef()

    const [updatePassword, { isLoading, isError }] = useUpdatePasswordMutation()

    const changeShowPassword = () => {
        setShowPassword(!showPassword)
    }
    const changeShowConfirmPassword = () => {
        setShowConfirm(!showConfirm)
    }

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
                id: auth.userInfo.id,
                userInfo: {
                    currentPassword: otp,
                    newPassword: password
                }
            }
            
            // state.auth has info for request; userInfo {id, temp_password}, token
            const resp = await updatePassword(payload).unwrap()
                .then((res) => {
                    dispatch(userInfoSet({'temp_password':false}))
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
                inclineComp={<ShowPasswordBtn
                    showPassword={showPassword}
                    setShowPasswordCB={changeShowPassword}
                ></ShowPasswordBtn>}
            >
            </FormInput>
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
                inclineComp={<ShowPasswordBtn
                    showPassword={showConfirm}
                    setShowPasswordCB={changeShowConfirmPassword}
                ></ShowPasswordBtn>}
            >
            </FormInput>
        </div>

        <button className='update-temp-password__submit-btn cursor_pointer' type='submit'>update password</button>
        <p className={ isError ? 'update-temp-password__msg-p-error' : 'update-temp-password__msg-p-succ'} ref={msgRef}>{msg}</p>
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