import React from 'react'
import { useState, useRef, useEffect } from 'react'
import { useParams, useNavigate, NavLink } from 'react-router'
import { useGetCameraQuery, useUpdateCameraMutation, useDeleteCameraMutation } from './cameraApiSlice'
import FormInput from '../../components/FormInput'
 
const CameraPage = () => {
    const { id } = useParams(); // id will be '123' if the URL is /user/123
  
    const navigate = useNavigate()

    const { data, isLoading, isError, refetch } = useGetCameraQuery(id)

    const [updateCamera, {isLoading: isLoadingUpdate, isError: isErrorUpdate}] = useUpdateCameraMutation()
    const [deleteCamera, {isLoading: isLoadingDelete, isError: isErrorDelete}] = useDeleteCameraMutation()

    const modifyLoading = isLoadingUpdate || isLoadingDelete
    const isErrorGen = isErrorUpdate || isErrorDelete
    
    const [cameraName, setCameraName] = useState('')
    const [cameraToken, setCameraToken] = useState('')
    const [editing, setEditing] = useState(false)
    const [msg, setMsg] = useState('')

    const msgRef = useRef()

    useEffect(() => {
      resetInfo()
    }, [data])

    const resetInfo = () => {
        if (data?.response) {
          setCameraName(data?.response.cameraName)
          setCameraToken(data?.response.cameraToken)
        }
    }

    const onSubmitHandler = (e) => {
      e.preventDefault()
    }

    const editOnClick = () => {
        setEditing(true)
    }

    const cancelEditOnClick = () => {
      setEditing(false)
      resetInfo()
    }

    const updateOnClick = async(e) => {
      e.preventDefault()
      const form = e.currentTarget
      setMsg('')

      try {
        const payload = {
          id,
          updateInfo: {
            cameraName,
            cameraToken
          }
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

    const editOptions = 
      <section className="camera-edit-options">
        <div className="camera-edit-options__editing-div">
        {editing ? 
            <>
              <button className="camera-edit-options__editing-div__cancel-btn cursor_pointer" type='button' onClick={cancelEditOnClick}>cancel</button>
              <button className="camera-edit-options__editing-div__update-btn cursor_pointer" type='submit'>update</button>
            </>
            : <button className="camera-edit-options__editing-div__edit-btn cursor_pointer" type='button' onClick={editOnClick}>edit</button>
          
        }
        </div>

        <button className='camera-edit-options__del-btn cursor_pointer' type='button' onClick={cameraDeleteOnClick}>delete</button>
      </section>

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
        <form className='camera-page__form' onSubmit={updateOnClick}>
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
            text = 'token'
            inputType = 'text'
            value = {cameraToken}
            onChangeCB = {setCameraToken}
            disabled = {!editing}
          ></FormInput>

          {editOptions}

          <p className={isErrorGen ? 'update-camera__p-error' : 'update-camera__p-succ'} ref={msgRef}>{msg}</p>

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