import React from 'react'
import { useState, useRef, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Link, useNavigate, useLocation, NavLink } from 'react-router'

import FormInput from '../../components/FormInput'
import ShowPasswordBtn from '../../components/ShowPasswordBtn'
import { useLoginMutation, useLogoutMutation } from './authApiSlice'
import { userInfoSet, authMessageSet } from './authSlice'
import UpdateTempPassword from './UpdateTempPassword'
import { errorStatusCleared } from '../error/errorSlice'

const login = () => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const location = useLocation()
    // const from = location.state?.from.pathname ?? '/'

    // controlled inputs
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [msg, setMsg] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [isTemp, setIsTemp] = useState(false)

    const emailRef = useRef()
    const msgRef = useRef()

    // store
    const { userInfo, token } = useSelector(state => state.auth)

    // api
    const [logIn, { data, isError, isLoading }] = useLoginMutation();
    const [logOut, {isLoading: isLoadingLogOut}] = useLogoutMutation()

    const resetControlledInputs = () => {
        setEmail('')
        setPassword('')
        setMsg('')
        setShowPassword(false)
    }

    const logOutHandler = async() => {
        try {
            const response = await logOut().unwrap()
                .then((payload) => {
                })
                .catch((error) => {
                })
        } catch (err) {
        } finally {
        }
    }

    useEffect(() => {
        if (!token) {
            logOutHandler()
        }
        
        // emailRef.current.focus()
    }, [])

    const changeShowPassword = () => {
        setShowPassword(!showPassword)
    }

    // event handler
    const loginFormSubmitHandler = async(e) => {
        e.preventDefault()
        const form = e.currentTarget
        setMsg('')
        dispatch(authMessageSet({message: ''}))

        try {
            const payload = {
                email,
                password
            }

            const response = await logIn(payload).unwrap()
                .then((res) => {
                    dispatch(errorStatusCleared())
                    const payload = {...res.user, token: res.token}
                    dispatch(userInfoSet(payload))
                    // dispatch(tokenSet({token: res.token}))

                    const temp = res.user.temp_password
                    if (!temp) {
                        resetControlledInputs()
                        // navigate to origin
                        // navigate(from, { replace: true })
                        navigate('/', { replace: true })
                    } else {
                        setIsTemp(temp)
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
                        setMsg('log in failed.')
                    }
                    msgRef.current.focus()
                })
        } catch (e) {
            setMsg('log in failed.')
            msgRef.current.focus()
        }
    }

    let content = ''
    
    if (isTemp && password !== '') {
        content = 
            <UpdateTempPassword 
                otp={password}
                forgot={false}
            />
    } else {
        content = 
            <form className='login__form' onSubmit={loginFormSubmitHandler}>
                <h1>Login</h1>
                <FormInput
                    ref = {emailRef}
                    required = {true}
                    text = 'email'
                    inputType = 'text'
                    value = {email}
                    onChangeCB = {setEmail}
                    disabled = {isLoading ? true : false}
                    inputId = 'login-email'
                >
                </FormInput>
                <div className="login__form__password">
                    <FormInput
                        ref = {null}
                        required = {true}
                        text = 'password'
                        inputType = {showPassword ? "text" : "password"}
                        value = {password}
                        onChangeCB = {setPassword}
                        disabled = {isLoading ? true : false}
                        inclineComp={<ShowPasswordBtn
                                showPassword={showPassword}
                                setShowPasswordCB={changeShowPassword}
                            ></ShowPasswordBtn>
                        }
                        inputId = 'login-password'
                        isPassword = {true}
                    >
                    </FormInput>
                </div>
                <button className='login__btn cursor_pointer' type='submit' disabled={isLoading}>log in</button>
                <NavLink to='/forgotPassword' className='login__forgot-pw-navlink'>forgot password</NavLink>
                <p className={isError ? 'login__msg-p-error' : 'login_msg-p-succ'} ref={msgRef}>{msg}</p>
                <div className={isLoading ? "loading__div" : "offscreen"}>
                    {
                        isLoading ? 
                        <div className="loader"></div> :
                        <></>
                    }
                </div>
            </form>
    }

  return (
    <section className='login'>
        {content}
    </section>
  )
}

export default login