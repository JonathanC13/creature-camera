import React from 'react'
import { useState, useRef } from 'react'
import FormInput from '../../components/FormInput'
import { useGetUserQuery, useUpdateUserMutation } from '../users/userApiSlice'
import { userInfoSet } from './authSlice'
import { useSelector, useDispatch } from 'react-redux'

const ChangeInfo = () => {
    const dispatch = useDispatch()

    const { id } = useSelector((state) => state.auth.userInfo)
    const { data, isLoading, isError } = useGetUserQuery(id)
    const [updateUser, { isLoading: isLoadingUpdate, isError: isErrorUpdate }] = useUpdateUserMutation()

    const [name, setName] = useState(data.name)
    const [email, setEmail] = useState(data.email)
    const [notifyAlways, setNotifyAlways] = useState(data.settingNotifyAlways)
    const [msg, setMsg] = useState('')

    const msgRef = useRef()

    const changeInfoOnClick = async(e) => {
        e.preventDefault()
        const form = e.currentTarget
        setMsg('')

        try {
            const payload = {
                id: id,
                userInfo: {
                    name,
                    email,
                    settingNotifyAlways: notifyAlways
                }
            }

            const response = await updateUser(payload).unwrap()
                .then((res) => {
                    dispatch(userInfoSet(res.response));
                    const successMsg = `user info updated.`
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
                        setMsg('update info failed.')
                    }
                    msgRef.current.focus()
                })
        } catch(e) {
            setMsg('update info failed.')
            msgRef.current.focus()
        }
    }

    let content = ''
    if (isError) {
      content = <p>Error</p>
    } else if (isLoading) {
      content = 
        <div className={(isLoading) ? "loading__div" : "offscreen"}>
            {
                (isLoading) ? 
                <div className="loader"></div> :
                <></>
            }
          </div>
    } else {
      content =
        <>
            <FormInput
                ref = {null}
                required = {true}
                text = 'name'
                inputType = 'text'
                value = {name}
                onChangeCB = {setName}
                disabled = {isLoadingUpdate ? true : false}
                inputId = 'change-info-name'
            ></FormInput>
            <FormInput
                ref = {null}
                required = {true}
                text = 'email'
                inputType = 'text'
                value = {email}
                onChangeCB = {setEmail}
                disabled = {isLoadingUpdate ? true : false}
                inputId = 'change-info-email'
            ></FormInput>
            <div className="change-info__form__notify-div">
                <label for="notifyAlways">Notify for every upload (else one email for first upload until next log in.)</label>
                <input type="checkbox" id="notifyId" name="notifyAlways" checked={notifyAlways} onChange={(e) => setNotifyAlways(e.target.checked)}></input>
            </div>

            <button className='change-info__form__update-btn' type='submit' disabled={isLoadingUpdate}>update</button>
            <p ref={msgRef}>{msg}</p>
            <div className={isLoadingUpdate ? "loading__div" : "offscreen"}>
                {
                    isLoadingUpdate ? 
                    <div className="loader"></div> :
                    <></>
                }
            </div>
        </>
    }

  return (
    <section className='change-info'>
        <form className="change-info__form" action='javascript:void(0)' onSubmit={changeInfoOnClick}>
            <h1 className="change-info__form__h1">change info</h1>
            {content}
        </form>
    </section>
  )
}

export default ChangeInfo