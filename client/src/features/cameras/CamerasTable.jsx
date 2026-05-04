import React from 'react'
import { useSelector } from 'react-redux'
import { authSlice } from '../auth/authSlice'

const CamerasTable = () => {
    const headers = new Map[
        ['cameraName', 'name'],
        ['cameraToken', 'token']
    ]
    const headerComps = new Array()
    for (const [k, v] of headers) {
        headerComps.push(<th className='cameras-table__header-tr-th'>{v}</th>)
    }
    headerComps.push(<th className='cameras-table__header-tr-th'></th>)

    const {data, refetch, isFetching, isLoading, isError} = useGetAllCamerasQuery(undefined, {
        pollingInterval: 600000,  // 10 minutes
    })
    
    const camerasInfoArr = data?.entities ? Object.entries(data.entities).map((e) => e[1]) : []

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
            <table className='cameras-table'>
                <tr className='cameras-table__header-tr'>{headerComps}</tr>
                {camerasInfoArr.map(camera => (
                    <CamerasRow key={camera.id} headers={headers} camera={camera} />
                ))}
            </table>
    }

    return (
        <section className="cameras-table__section">
            <button onClick={refetch} disabled={isFetching}>
                {isFetching ? 'Refreshing...' : 'Refresh Data'}
            </button>

            {content}        
            
        </section>
    )
}

export default CamerasTable