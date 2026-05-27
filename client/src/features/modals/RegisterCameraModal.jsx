import React from 'react'
import { useState, useRef } from 'react'
import FormInput from '../../components/FormInput'
import { useCreateCameraMutation } from '../cameras/cameraApiSlice'

const RegisterCameraModal = () => {
    const msgRef = useRef()

    const [msg, setMsg] = useState('')
    const [cameraName, setCameraName] = useState('')
    const [cameraToken, setCameraToken] = useState('')

    const [createCamera, {data, isLoading, isError}] = useCreateCameraMutation()

    const resetControlledInputs = () => {
        setCameraName('')
        setCameraToken('')
    }

    const registerCameraOnClick = async(e) => {
        e.preventDefault()
        const form = e.currentTarget
        setMsg('')

        try {
            const payload = {
                cameraName,
                cameraToken
            }

            const response = await createCamera(payload).unwrap()
                .then((res) => {
                    const successMsg = `Camera added.`
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
    <section className="register-camera-modal">
        <form onSubmit={registerCameraOnClick} className='register__form'>
            <h1 className="register__form__h1">register camera</h1>
            <FormInput
                ref = {null}
                required = {true}
                text = 'name'
                inputType = 'text'
                value = {cameraName}
                onChangeCB = {setCameraName}
                inputId = 'register-camera-name'
            ></FormInput>
            <FormInput
                ref = {null}
                required = {true}
                text = 'token'
                inputType = 'text'
                value = {cameraToken}
                onChangeCB = {setCameraToken}
                inputId = 'register-camera-token'
            ></FormInput>

            <div className="register__form__div-btns">
                <button className='register__form__submit-btn cursor_pointer' type='submit'>register</button>
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
  )
}

export default RegisterCameraModal