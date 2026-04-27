import React from 'react'
import { memo } from 'react'
import { Link } from 'react-router'

const UsersRow = memo((
    headers,
    user
) => {

    const link = `/users/${user.id}`

    const cellComps = new Array()
    for (const [k, v] of headers) {
        cellComps.push(<td className='users-row__tr-td'>{user[k]}</td>)
    }
    cellComps.push(<td className='users-row__tr-td'>
        <Link to={link} className="users-row__view-link">
            view
        </Link>
    </td>)

  return (
    <tr className='users-row__tr'>
        {cellComps}
    </tr>
  )
})

export default UsersRow