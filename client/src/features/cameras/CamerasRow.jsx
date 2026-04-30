import React from 'react'
import { memo } from 'react'
import { Link } from 'react-router'

const CamerasRow = memo(({
    headers,
    camera
}) => {
    const link = `/admin/cameras/${camera.id}`

    const cellComps = new Array()
    for (const [k, v] of headers) {
        cellComps.push(<td className='cameras-row__tr-td'>{camera[k]}</td>)
    }
    cellComps.push(<td className='cameras-row__tr-td'>
        <Link to={link} className="cameras-row__view-link">
            view
        </Link>
    </td>)

  return (
    <tr className='cameras-row__tr'>
        {cellComps}
    </tr>
  )
})

export default CamerasRow