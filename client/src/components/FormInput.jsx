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
        inputId,
        isPassword = false
    }
) => {

  return (
    <section className='form-input'>
        <label className='form-input__label' htmlFor={inputId}>{text}</label>
        <div className="form-input__div">
            {isPassword 
                ? <input className='form-input__div__input' 
                    id={inputId}
                    ref={ref}
                    type = {inputType}
                    required={required}
                    value = {value}
                    onChange= { (elem) => { onChangeCB(elem.target.value) } }
                    disabled={disabled}
                />
                : <textarea className='form-input__div__input' 
                    rows='2'
                    id={inputId}
                    ref={ref}
                    type = {inputType}
                    required={required}
                    value = {value}
                    onChange= { (elem) => { onChangeCB(elem.target.value) } }
                    disabled={disabled}
                />
            }
            
            {inclineComp}
        </div>
    </section>
  )
}

export default FormInput