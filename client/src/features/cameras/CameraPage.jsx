import React from 'react'
import { useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router'
import { useGetCameraQuery, useUpdateCameraMutation, useDeleteCameraMutation } from './cameraApiSlice'
import FormInput from '../../components/FormInput'
 
const CameraPage = () => {
    const { id } = useParams(); // id will be '123' if the URL is /user/123

    const navigate = useNavigate()

    const { data, isLoading, isError, refetch } = useGetCameraQuery(id)

    const [updateCamera, {isLoading: isLoadingUpdate}] = useUpdateCameraMutation()
    const [deleteCamera, {isLoading: isLoadingDelete}] = useDeleteCameraMutation()

    const modifyLoading = isLoadingUpdate || isLoadingDelete

    const [cameraName, setCameraName] = useState(data.cameraName ?? '')
    const [cameraToken, setCameraToken] = useState(data.cameraToken ?? '')
    const [editing, setEditing] = useState(false)
    const [msg, setMsg] = useState('')

    const msgRef = useRef()

    const editOnClick = () => {
        setEditing(true)
    }

    const cancelEditOnClick = () => {
      setEditing(false)
      refetch()
    }

    const updateOnClick = async(e) => {
      e.preventDefault()
      const form = e.currentTarget
      setMsg('')

      try {
        const payload = {
          cameraName,
          cameraToken
        }

        const response = await updateCamera(payload).unwrap()
          .then((res) => {
              setMsg('camera updated.')
          })
          .catch((error) => {
              // console.log(error)
              if (!error.data) {
                  setMsg('no server response.')
              } else if (error?.data?.message) {
                  const message = error?.data?.message ?? 'error.'
                  setMsg(message)
              } else {
                  setMsg('update failed.')
              }
              msgRef.current.focus()
            })
      } catch (e) {
        setMsg('update failed.')
        msgRef.current.focus()
      }
    }

    const cameraDeleteOnClick = async(e) => {
      await deleteCamera(id)
      navigate("/cameras", { replace: true }) // { replace: true } so cannot go back to this page.
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
        <form className='camera-page__form' action='javascript:void(0)'>
          <FormInput
            ref = {null}
            required = {true}
            text = 'name'
            inputType = 'text'
            value = {cameraName}
            onChangeCB = {setCameraName}
            disabled = {!editing}
          ></FormInput>
          <FormInput
            ref = {null}
            required = {true}
            text = 'email'
            inputType = 'text'
            value = {cameraToken}
            onChangeCB = {setCameraToken}
            disabled = {!editing}
          ></FormInput>

          <div className="camera-page__form__editing-div">
          {editing ? 
            <>
              <button className="camera-page__form__editing-div__cancel-btn" onClick={cancelEditOnClick}>cancel</button>
              <button className="camera-page__form__editing-div__update-btn" onClick={updateOnClick}>update</button>
            </>
            : <button className="camera-page__form__editing-div__edit-btn" onClick={editOnClick}>edit</button>
          }
          </div>

          <button className='camera-page__form__del-btn' onClick={cameraDeleteOnClick}>delete</button>

          <p ref={msgRef}>{msg}</p>

          {(modifyLoading) && 
            <div className={(modifyLoading) ? "loading__div" : "offscreen"}>
            {
                (modifyLoading) ? 
                <div className="loader"></div> :
                <></>
            }
            </div>
          }
        </form>
    }

  return (
    <section className='camera-page'>
      <NavLink 
        to="/cameras" 
        className='camera-page__navlink-back'
      >
        To all cameras
      </NavLink>

      <h1 className='camera-page__h1'>Camera</h1>

      {content}

    </section>
  )
}

export default CameraPage