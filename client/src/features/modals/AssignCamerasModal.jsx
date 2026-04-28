import React from 'react'
import { useState, useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import { useGetAllCamerasQuery, selectCameraEntities } from '../cameras/cameraApiSlice'
import { useUpdateUserMutation } from '../users/userApiSlice'
import { closeModal } from "../modals"

// Item Component for displaying each list item
const ListItem = ({ item, onSelect }) => (
  <div className="list-item">
    <input
      type="checkbox"
      checked={item.selected}
      onChange={() => onSelect(item)}
    />
    <span>{item.value}</span>
  </div>
)

const AssignCamerasModal = (
    id
) => {

  const msgRef = useRef()
  const [msg, setMsg] = useState()

  const [ updateUser, { isLoading: isLoadingUpdate, isError: isErrorUpdate }] = useUpdateUserMutation()
  const { data: userData, isLoading: isLoadingUser, isError: isErrorUser, refetch: retechUser } = useGetUserQuery(id)
  const { data, isLoading: isLoadingCameras, refetch, isFetching, isError: isErrorCameras } = useGetAllCamerasQuery()
  // const cameraLookup = useSelector(selectCameraEntities)
  const isLoading = isLoadingUser || isLoadingCameras
  const isError = isErrorUser || isErrorCameras

  const [assignedCameras, setAssignedCameras] = useState(userData?.subscriptions)  // ids

  // current selected in each box.
  const [activeAvailable, setActiveAvailable] = useState([])
  const [activeSelected, setActiveSelected] = useState([])

  // derive seperate lists
  const availableItems = data.filter(item => !assignedCameras.includes(item.id));
  const selectedItems = data.filter(item => assignedCameras.includes(item.id));

  // useEffect(() => {
  // }, [data])

  // Move selected items from available to selected
  const moveToSelected = () => {
    setAssignedCameras(prev => [
      ...prev,
      ...activeAvailable.filter(id => !prev.includes(id)) // don't add duplicate
    ])

    setActiveAvailable([]) // clear selection after move
  }

  // Move selected items from selected to available
  const moveToAvailable = () => {
    setAssignedCameras(prev =>
      prev.filter(id => !activeSelected.includes(id))
    )

    setActiveSelected([])
  };
  
  const updateUserOnClick = () => {
    setMsg('')
    try {
      // updateUser will invalidate cache for id, so the UserPage data will refetch.
      const response = await updateUser({id: id, subscriptions: assignedCameras}).unwrap()
        .then((res) => {
          closeModal()
        })
        .catch((error) => {
            // console.log(error)
            if (!error.data) {
                setMsg('no server response.')
            } else if (error?.data?.message) {
                const message = error?.data?.message ?? 'error.'
                setMsg(message)
            } else {
                setMsg('Update failed.')
            }
            msgRef.current.focus()
        })
    } catch(e) {
      setMsg('Update failed.')
      msgRef.current.focus()
    }
  }

  const dualListbox =
    <div className="dual-listbox-container">
      <div className="dual-listbox-container__div">
        <h2 className="dual-listbox-container__div__h2">Available</h2>
        <select
          multiple
          value={activeAvailable}
          onChange={e =>
            setActiveAvailable(
              Array.from(e.target.selectedOptions, opt => opt.value)
            )
          }
        >
          {availableItems.map(item => (
            <option key={item.id} value={item.id}>
              {item.cameraName}
            </option>
          ))}
        </select>
      </div>

      <div className="dual-listbox-container__div">
        <button className="dual-listbox-container__div__add-btn" onClick={moveToSelected}>{'>>'}</button>
        <button className="dual-listbox-container__div__remove-btn" onClick={moveToAvailable}>{'<<'}</button>
      </div>

      <div className="dual-listbox-container__div">
        <h2 className="dual-listbox-container__div__h2">Assigned</h2>
        <select
          multiple
          value={activeSelected}
          onChange={e =>
            setActiveSelected(
              Array.from(e.target.selectedOptions, opt => opt.value)
            )
          }
        >
          {selectedItems.map(item => (
            <option key={item.id} value={item.id}>
              {item.cameraName}
            </option>
          ))}
        </select>
      </div>
    </div>

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
        {dualListbox}
        <button onClick={updateUserOnClick} disabled={isLoadingUpdate}>Finalize</button>
      </>
  }
    
  return (
    <section className='assign-cameras-modal'>
      <h1 className="assign-cameras-modal__h1">Assign cameras</h1>
      <button onClick={refetch} disabled={isFetching}>
        {isFetching ? 'Refreshing...' : 'Refresh Data'}
      </button>

      {content}

      <div className={(isLoadingUpdate) ? "loading__div" : "offscreen"}>
        {
            (isLoadingUpdate) ? 
            <div className="loader"></div> :
            <></>
        }
      </div>
      <p className='assign-cameras-modal__p' ref={msgRef}>{msg}</p>
      
    </section>
  )
}

export default AssignCamerasModal