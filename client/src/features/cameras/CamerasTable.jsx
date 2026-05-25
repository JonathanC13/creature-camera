import React from 'react'
import { useSelector } from 'react-redux'
import { authSlice } from '../auth/authSlice'
import { useGetAllCamerasQuery } from './cameraApiSlice'
import CamerasRow from './CamerasRow'

const CamerasTable = () => {
    const headers = new Map([
        ['cameraName', [0, 'name']],
        ['cameraToken', [1, 'token']]
    ])
    const headerComps = new Array()
    for (const [k, v] of headers) {
        headerComps.push(<th key={v[0]} className='cameras-table__header-tr-th'>{v[1]}</th>)
    }
    headerComps.push(<th key={-1} className='cameras-table__header-tr-th'></th>)

    const {data, refetch, isFetching, isLoading, isError} = useGetAllCamerasQuery(undefined, {
        pollingInterval: 600000,  // 10 minutes
        refetchOnMountOrArgChange: true
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
                <thead>
                    <tr className='cameras-table__header-tr'>{headerComps}</tr>
                </thead>
                <tbody>
                    {camerasInfoArr.map(camera => (
                        <CamerasRow key={camera.id} headers={headers} camera={camera} />
                    ))}
                </tbody>
            </table>
    }

    return (
        <section className="cameras-table__section">
            <button className='refetch-btn cursor_pointer' onClick={refetch} disabled={isFetching}>
                {isFetching ? 'Refreshing...' : 'Refresh Data'}
            </button>

            {content}        
            
        </section>
    )
}

export default CamerasTable