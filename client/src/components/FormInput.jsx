import React from 'react'

const FormInput = (
    {
        ref = null,
        required = false,
        text = 'placeholder',
        inputType = 'text',
        value = null,
        onChangeCB = () => {},
        disabled = false,
        inclineComp,
        inputId
    }
) => {

  return (
    <section className='form-input'>
        <label className='form-input__label' htmlFor={inputId}>{text}</label>
        <div className="form-input__div">
            <input className='form-input__div__input' 
                id={inputId}
                ref={ref}
                type = {inputType}
                required={required}
                value = {value}
                onChange= { (elem) => { onChangeCB(elem.target.value) } }
                disabled={disabled}
            />
            {inclineComp}
        </div>
    </section>
  )
}

export default FormInput