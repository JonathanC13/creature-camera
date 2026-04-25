import React from 'react'

const UserPage = () => {
    const { id } = useParams(); // id will be '123' if the URL is /user/123

  return (
    <div>UserPage</div>
  )
}

export default UserPage