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
        <form onSubmit={registerCameraOnClick}>
            <h1 className="register-camera-modal__h1">register camera</h1>
            <FormInput
                ref = {null}
                required = {true}
                text = 'name'
                inputType = 'text'
                value = {cameraName}
                onChangeCB = {setCameraName}
            ></FormInput>
            <FormInput
                ref = {null}
                required = {true}
                text = 'name'
                inputType = 'text'
                value = {cameraToken}
                onChangeCB = {setCameraToken}
            ></FormInput>

            <button className='register-camera-modal__form__submit-btn' type='submit'>register</button>
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

export default RegisterCameraModal