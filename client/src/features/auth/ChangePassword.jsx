import React from 'react'
import { useState, useRef } from 'react'
import { useSelector } from 'react-redux'
import { useUpdatePasswordMutation } from './authApiSlice'
import FormInput from '../../components/FormInput'
import ShowPasswordBtn from '../../components/ShowPasswordBtn'

const ChangePassword = () => {

    const [currPassword, setcurrPassword] = useState('')
    const [showcurr, setShowCurr] = useState(false)
    const [newPassword, setNewPassword] = useState('')
    const [showNew, setShowNew] = useState(false)
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showConfirm, setShowConfirm] = useState(false)
    const [msg, setMsg] = useState('')

    const msgRef = useRef()

    const { id } = useSelector((state) => state.auth.userInfo)

    const [updatePassword, { data, isError, isLoading }] = useUpdatePasswordMutation();

    const changeShowCurr = () => {
        setShowCurr(!showcurr)
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

    const changePasswordOnClick = async(e) => {
        e.preventDefault()
        const form = e.currentTarget
        setMsg('')

        if (newPassword !== confirmPassword) {
            setMsg('new password and confirm password do not match.')
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
        <form className="change-password__form" action='javascript:void(0)' onSubmit={changePasswordOnClick}>
            <h1 className='change-password__form__h1'>Change password</h1>
            <div className="change-password__form__oldPass-div">
                <FormInput
                    ref = {null}
                    required = {true}
                    text = 'current password'
                    inputType = {currPassword ? "text" : "password"}
                    value = {currPassword}
                    onChangeCB = {setCurrPassword}
                    disabled = {isLoading ? true : false}
                ></FormInput>
                <ShowPasswordBtn
                    showPassword={showCurr}
                    setShowPasswordCB={changeShowCurr}
                ></ShowPasswordBtn>
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
                ></FormInput>
                <ShowPasswordBtn
                    showPassword={showNew}
                    setShowPasswordCB={changeShowNew}
                ></ShowPasswordBtn>
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
                ></FormInput>
                <ShowPasswordBtn
                    showPassword={showConfirm}
                    setShowPasswordCB={changeShowConfirm}
                ></ShowPasswordBtn>
            </div>

            <button className='change-password__form__update-btn' type='submit' disabled={isLoading}>update</button>
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

export default ChangePassword