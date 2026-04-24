import React from 'react'
import { useState, useRef, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Link, useNavigate, useLocation } from 'react-router'

import FormInput from '../../components/FormInput'
import ShowPasswordBtn from '../../components/ShowPasswordBtn'
import { useLoginMutation, useLogoutMutation } from './authApiSlice'
import { userInfoSet, tokenSet, authMessageSet } from './authSlice'

const login = () => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const location = useLocation()
    const from = location.state?.from.pathname ?? '/'

    // controlled inputs
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [msg, setMsg] = useState('')
    const [showPassword, setShowPassword] = useState(false)

    const emailRef = useRef()
    const msgRef = useRef()

    // store
    const { userInfo, token } = useSelector(state => state.auth)

    // api
    const [logIn, { data, error, isLoading }] = useLoginMutation();
    const [logOut, {isLoadingLogOut}] = useLogoutMutation()

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
        
        emailRef.current.focus()
    }, [])

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
                    dispatch(userInfoSet(res.user))
                    dispatch(tokenSet(res.token))

                    // clear form
                    resetControlledInputs()
                    // navigate to dashboard
                    navigate(from, { replace: true })
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

  return (
    <section className='login'>
        <form className='login__form' onSubmit={loginFormSubmitHandler}>
            <h1>Login</h1>
            <FormInput
                ref = {emailRef}
                required = {true}
                text = 'email'
                inputType = 'text'
                value = {email}
                onChangeCB = {setEmail}
            >
            </FormInput>
            <div className="login__form__password">
                <FormInput
                    ref = {null}
                    required = {true}
                    text = 'password'
                    inputType = 'password'
                    value = {password}
                    onChangeCB = {setPassword}
                >
                </FormInput>
                <ShowPasswordBtn
                    showPassword={showPassword}
                    setShowPasswordCB={setShowPassword}
                ></ShowPasswordBtn>
            </div>
            <button type='submit' disabled={isLoading}>log in</button>
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

export default login