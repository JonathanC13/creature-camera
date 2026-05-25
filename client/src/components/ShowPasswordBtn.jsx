import React from 'react'
import { FaEye, FaEyeSlash } from 'react-icons/fa6'

const ShowPasswordBtn = ({
    showPassword = false,
    setShowPasswordCB = () => {},
}) => {
    
  return (
        <button 
            type="button" 
            className={`cursor_pointer show-password__button`} 
            onClick={() => {setShowPasswordCB()}}>
                {showPassword ? <FaEyeSlash></FaEyeSlash> : <FaEye></FaEye>}
        </button>
    )
}

export default ShowPasswordBtn