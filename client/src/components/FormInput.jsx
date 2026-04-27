import React from 'react'

const FormInput = (
    {
        ref = null,
        required = false,
        text = 'placeholder',
        inputType = 'text',
        value = null,
        onChangeCB = () => {},
        disabled = false
    }
) => {
  return (
    <section className='form-input'>
        <label className='form-input__label'>{text}</label>
        <input className='form-input__input' 
            type = {inputType}
            {...(required ? 'required' : '')}
            value = {value}
            onChange= { (elem) => { onChangeCB(elem.target.value) } }
            {...(disabled ? 'disabled' : '')}
        />
    </section>
  )
}

export default FormInput