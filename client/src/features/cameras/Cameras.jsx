import React from 'react'
import CamerasTable from './CamerasTable'
import { useDispatch } from 'react-redux'
import { openModal } from '../modals/modalSlice'

const Cameras = () => {
    const dispatch = useDispatch()

    const openRegisterModel = () => {
        dispatch(openModal( { type: 'registerCamera', props: {} } ))
    }

  return (
    <section className='cameras'>
        <h1 className="cameras__h1">Cameras</h1>
        <button className="cameras__register-btn" onClick={openRegisterModel}>register</button>

        <CamerasTable></CamerasTable>
    </section>
  )
}

export default Cameras