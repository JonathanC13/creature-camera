import React from 'react'
import { Link } from 'react-router-dom'

const Unauthorized = () => {
  return (
    <div className='missing__div'>
      <section className='missing__section'>
        <h1 className='missing__h1'>Unauthorized!</h1>
        <Link to="/" className='missing__link cursor_pointer'>To Home</Link>
      </section>
    </div>
  )
}

export default Unauthorized