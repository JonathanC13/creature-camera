import React from 'react'
import { useState, useRef } from 'react'
import { useDispatch } from 'react-redux'
import FormInput from '../../components/FormInput'
import ShowPasswordBtn from '../../components/ShowPasswordBtn'
import { loggedOut, userInfoSet } from './authSlice'
import { useForgotPasswordMutation, useValidateOTPMutation } from './authApiSlice'
import UpdateTempPassword from './UpdateTempPassword'

const ForgotPassword = () => {
    const dispatch = useDispatch()

    const [email, setEmail] = useState('')
    const [emailMsg, setEmailMsg] = useState('')
    const [showOTPForm, setShowOTPForm] = useState(false)
    const [otp, setOtp] = useState('')
    const [showOtp, setShowOtp] = useState(false)
    const [otpMsg, setOtpMsg] = useState('')
    const [showNewPassForm, setShowNewPassForm] = useState(false)

    const emailMsgRef = useRef()
    const otpMsgRef = useRef()

    const [forgotPassword, { isLoading: isLoadingEmail, isError: isErrorEmail }] = useForgotPasswordMutation()
    const [validateOTP, { isLoading: isLoadingOTP, isError: isErrorOTP }] = useValidateOTPMutation()

    const changeShowOtp = () => {
        setShowOtp(!showOtp)
    }

    const sendEmailOnClick = async(e) => {
        e.preventDefault()
        const form = e.currentTarget

        // reset process
        dispatch(loggedOut())
        setShowOtp(false)
        setOtp('')
        setOtpMsg('')
        setShowNewPassForm(false)

        try {
            const resp = await forgotPassword( { email } ).unwrap()
                .then((res) => {
                    setEmailMsg('if the email address is valid you will have a One Time Password, via email, please type it below.')
                    emailMsgRef.current.focus()
                    setShowOTPForm(true)
                })
                .catch((error) => {
                    // console.log(error)
                    if (!error.data) {
                        setEmailMsg('no server response.')
                    } else if (error?.data?.message) {
                        const message = error?.data?.message ?? 'error.'
                        setEmailMsg(message)
                    } else {
                        setEmailMsg('forgot password failed.')
                    }
                    emailMsgRef.current.focus()
                })
        } catch(e) {
            setEmailMsg('forgot password failed.')
            console.log(e)
            emailMsgRef.current.focus()
        }
    }

    const validateOTPOnClick = async(e) => {
        e.preventDefault()
        const form = e.currentTarget

        try {
            const payload = {
                email,
                password: otp
            }
            
            const resp = await validateOTP( payload ).unwrap()
                .then((res) => {
                    setOtpMsg('verified, update your password below.')
                    otpMsgRef.current.focus()

                    // res: {user: {id: userDocument.getId(), temp_password: userDocument.temp_password}, token: oneTimeToken}
                    const obj = {
                        id: res.user.id,
                        temp_password: res.user.temp_password,
                        token: res.token
                    }
                    
                    dispatch(userInfoSet(obj))
                    
                    setShowNewPassForm(true)
                })
                .catch((error) => {
                    // console.log(error)
                    if (!error.data) {
                        setOtpMsg('no server response.')
                    } else if (error?.data?.message) {
                        const message = error?.data?.message ?? 'error.'
                        setOtpMsg(message)
                    } else {
                        setOtpMsg('OTP failed.')
                    }
                    otpMsgRef.current.focus()
                })
        } catch(e) {
            setOtpMsg('OTP failed.')
            otpMsgRef.current.focus()
        }
    }

    const onSubmitHandler = (e) => {
        e.preventDefault()
    }
    
    const contentOTP = 
        <form className="forgot-password__OTP-form" onSubmit={validateOTPOnClick}>
            <h2 className="forgot-password__OTP-form__h2">enter OTP from email</h2>
            <div className="forgot-password__OTP-form__div">
                <FormInput
                    ref = {null}
                    required = {true}
                    text = 'one time password'
                    inputType = {showOtp ? 'text' : 'password'}
                    value = {otp}
                    onChangeCB = {setOtp}
                    disabled = {isLoadingOTP ? true : false}
                    inclineComp={<ShowPasswordBtn
                        showPassword={showOtp}
                        setShowPasswordCB={changeShowOtp}
                    ></ShowPasswordBtn>}
                    inputId = 'forgot-password-otp'
                    isPassword = {true}
                >
                </FormInput>
            </div>
            <button className='forgot-password__verify-otp-btn cursor_pointer' type='submit'>verify otp</button>
            <p className={isErrorOTP ? 'update-msg__p-error' : 'update-msg__p-succ'} ref={otpMsgRef}>{otpMsg}</p>
            <div className={isLoadingOTP ? "loading__div" : "offscreen"}>
                {
                    isLoadingOTP ? 
                    <div className="loader"></div> :
                    <></>
                }
            </div>
        </form>

  return (
    <section className='forgot-password'>
        <h1 className="forgot-password__h1">forgot password</h1>
        <form className="forgot-password__email-form" onSubmit={sendEmailOnClick}>
            <h2 className="forgot-password__email-form__h2">enter account email</h2>
            <div className="forgot-password__email-form__div">
                <FormInput
                    ref = {null}
                    required = {true}
                    text = 'email'
                    inputType = 'text'
                    value = {email}
                    onChangeCB = {setEmail}
                    disabled = {isLoadingEmail ? true : false}
                    inputId = 'forgot-password-email'
                >
                </FormInput>
            </div>
            <button className='forgot-password__email__send-btn cursor_pointer' type='submit'>send one time password</button>
            <p className={isErrorEmail ? 'update-msg__p-error' : 'update-msg__p-succ'} ref={emailMsgRef}>{emailMsg}</p>
            <div className={isLoadingEmail ? "loading__div" : "offscreen"}>
                {
                    isLoadingEmail ? 
                    <div className="loader"></div> :
                    <></>
                }
            </div>
        </form>

        {showOTPForm && contentOTP}

        {showNewPassForm && 
            <UpdateTempPassword 
                otp={otp}
                forgot={true}
            />}
    </section>
  )
}

export default ForgotPassword