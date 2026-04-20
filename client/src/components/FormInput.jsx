import React from 'react'

const FormInput = (
    {
        ref = null,
        required = false,
        text = 'placeholder',
        inputType = 'text',
        value = null,
        onChangeCB = () => {}
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
        />
    </section>
  )
}

export default FormInput