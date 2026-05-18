import React from 'react'
import { useState, useRef } from 'react'
import { useSelector } from 'react-redux'
import { useUpdatePasswordMutation } from './authApiSlice'
import FormInput from '../../components/FormInput'
import ShowPasswordBtn from '../../components/ShowPasswordBtn'

const ChangePassword = () => {

    const [currPassword, setCurrPassword] = useState('')
    const [showCurr, setShowCurr] = useState(false)
    const [newPassword, setNewPassword] = useState('')
    const [showNew, setShowNew] = useState(false)
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showConfirm, setShowConfirm] = useState(false)
    const [msg, setMsg] = useState('')
    const [passError, setPassError] = useState(false)

    const msgRef = useRef()

    const { id } = useSelector((state) => state.auth.userInfo)

    const [updatePassword, { data, isError, isLoading }] = useUpdatePasswordMutation();

    const changeShowCurr = () => {
        setShowCurr(!showCurr)
    }
    const changeShowNew = () => {
        setShowNew(!showNew)
    }
    const changeShowConfirm = () => {
        setShowConfirm(!showConfirm)
    }

    const resetControlledInputs = () => {
        setCurrPassword('')
        setNewPassword('')
        setConfirmPassword('')
    }

    const onSubmitHandler = (e) => {
        e.preventDefault()
    }

    const changePasswordOnClick = async(e) => {
        e.preventDefault()
        const form = e.currentTarget
        setMsg('')
        setPassError(false)

        if (newPassword !== confirmPassword) {
            setMsg('new password and confirm password do not match.')
            setPassError(true)
            msgRef.current.focus()
            return
        }

        try {
            const payload = {
                id: id,
                userInfo: {
                    currentPassword: currPassword,
                    newPassword: newPassword
                }
            }

            const response = await updatePassword(payload).unwrap()
                .then((res) => {
                    const successMsg = `Password updated.`
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
    <section className='change-password'>
        <form className="change-password__form" onSubmit={changePasswordOnClick}>
            <h1 className='change-password__form__h1'>change password</h1>
            <div className="change-password__form__oldPass-div">
                <FormInput
                    ref = {null}
                    required = {true}
                    text = 'current password'
                    inputType = {showCurr ? "text" : "password"}
                    value = {currPassword}
                    onChangeCB = {setCurrPassword}
                    disabled = {isLoading ? true : false}
                    inclineComp={<ShowPasswordBtn
                        showPassword={showCurr}
                        setShowPasswordCB={changeShowCurr}
                    ></ShowPasswordBtn>}
                    inputId = 'change-password-curr'
                    isPassword = {true}
                ></FormInput>
            </div>
            <div className="change-password__form__newPass-div">
                <FormInput
                    ref = {null}
                    required = {true}
                    text = 'new password'
                    inputType = {showNew ? "text" : "password"}
                    value = {newPassword}
                    onChangeCB = {setNewPassword}
                    disabled = {isLoading ? true : false}
                    inclineComp={<ShowPasswordBtn
                        showPassword={showNew}
                        setShowPasswordCB={changeShowNew}
                    ></ShowPasswordBtn>}
                    inputId = 'change-password-new'
                    isPassword = {true}
                ></FormInput>
            </div>
            <div className="change-password__form__oldPass-div">
                <FormInput
                    ref = {null}
                    required = {true}
                    text = 'confirm password'
                    inputType = {showConfirm ? "text" : "password"}
                    value = {confirmPassword}
                    onChangeCB = {setConfirmPassword}
                    disabled = {isLoading ? true : false}
                    inclineComp={<ShowPasswordBtn
                        showPassword={showConfirm}
                        setShowPasswordCB={changeShowConfirm}
                    ></ShowPasswordBtn>}
                    inputId = 'change-password-confirm'
                    isPassword = {true}
                ></FormInput>
            </div>

            <div className="change-password__form__opt-div">
                <button className='change-password__form__update-btn cursor_pointer' type='submit' disabled={isLoading}>update password</button>
            </div>

            <div className="change-pass__form__status-div">
                <p className={isError || passError ? 'update-msg__p-error' : 'update-msg__p-succ'} ref={msgRef}>{msg}</p>
                <div className={isLoading ? "loading__div" : "offscreen"}>
                    {
                        isLoading ? 
                        <div className="loader"></div> :
                        <></>
                    }
                </div>
            </div>
        </form>
    </section>
  )
}

export default ChangePassword