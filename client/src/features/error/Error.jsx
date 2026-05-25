import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { errorStatusCleared } from './errorSlice'

const Error = () => {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const { status, message } = useSelector((state) => state.error)
    
    let errorTitle = ''
    let errorMessage = ''
    switch (status) {
        case 'FETCH_ERROR': {
            errorTitle = 'Server error.'
            errorMessage = 'Server may be offline.'
            break
        }
        default:
            errorTitle = status
            errorMessage = message
            break
    }

    const goHome = () => {
        dispatch(errorStatusCleared())
        navigate('/')
    }

  return (
    <div className='error__div'>
        <section className='error__section'>
            <h1 className='error__h1'>{errorTitle}</h1>
            <p>{errorMessage}</p>
            <button onClick={goHome} className='cursor_pointer'>Reload home</button>
        </section>
    </div>
  )
}

export default Error