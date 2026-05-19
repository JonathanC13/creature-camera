import React from 'react'
import { useState, useRef, useEffect } from 'react'
import FormInput from '../../components/FormInput'
import { useGetSelfQuery, useUpdateUserInfoMutation } from '../auth/authApiSlice'
import { userInfoSet } from './authSlice'
import { useSelector, useDispatch } from 'react-redux'

const ChangeInfo = () => {
    const dispatch = useDispatch()

    const { id } = useSelector((state) => state.auth.userInfo)
    const { data, refetch, isLoading, isError } = useGetSelfQuery(id, { skip: !id })
    const [updateUser, { isLoading: isLoadingUpdate, isError: isErrorUpdate }] = useUpdateUserInfoMutation()

    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [notifyAlways, setNotifyAlways] = useState(false)
    const [msg, setMsg] = useState('')

    const msgRef = useRef()

    useEffect(() => {
        if (data?.user) {
            setName(data.user.name)
            setEmail(data.user.email)
            setNotifyAlways(data.user.settingNotifyAlways)
        }
    }, [data])

    const resetInfo = () => {
        setMsg('')
        if (data?.user) {
            setName(data.user.name)
            setEmail(data.user.email)
            setNotifyAlways(data.user.settingNotifyAlways)
        }
    }

    const onSubmitHandler = (e) => {
        e.preventDefault()
    }

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
                    dispatch(userInfoSet(res.user));
                    const successMsg = `user info updated.`
                    setMsg(successMsg)
                    msgRef.current.focus()
                })
                .catch((error) => {
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
                <label className='change-info__form__notify-div__lbl' htmlFor="notifyAlways">Notify for every upload (else one email for first upload until next log in.): </label>
                <input className='change-info__form__notify-div__input cursor_pointer' type="checkbox" id="notifyId" name="notifyAlways" checked={notifyAlways} onChange={(e) => setNotifyAlways(e.target.checked)}></input>
            </div>

            <div className="change-info__form__opt-div">
                <button className='change-info__form__reset-btn cursor_pointer' type='button' onClick={resetInfo}>reset to current</button>
                <button className='change-info__form__update-btn cursor_pointer' type='submit' disabled={isLoadingUpdate}>update info</button>
            </div>
            
            <div className="change-info__form__status-div">
                <p className={isError ? 'update-msg__p-error' : 'update-msg__p-succ'} ref={msgRef}>{msg}</p>
                <div className={isLoadingUpdate ? "loading__div" : "offscreen"}>
                    {
                        isLoadingUpdate ? 
                        <div className="loader"></div> :
                        <></>
                    }
                </div>
            </div>
        </>
    }
    
  return (
    <section className='change-info'>
        <form className="change-info__form" onSubmit={changeInfoOnClick}>
            <h1 className="change-info__form__h1">change info</h1>
            {content}
        </form>
    </section>
  )
}

export default ChangeInfo