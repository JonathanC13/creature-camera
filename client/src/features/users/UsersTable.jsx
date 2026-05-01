import React from 'react'
import UsersRow from './UsersRow'
import { useGetAllUsersQuery } from './userApiSlice'

const UsersTable = () => {

    const headers = new Map([
        ['name', [0, 'name']],
        ['email', [1, 'email']], 
        ['roleName', [2, 'role']]
    ])
    const headerComps = new Array()
    for (const [k, v] of headers) {
        headerComps.push(<th key={v[0]} className='users-table__header-tr-th'>{v[1]}</th>)
    }
    headerComps.push(<th key={-1} className='users-table__header-tr-th'></th>)

    const {data, refetch, isFetching, isLoading, isError} = useGetAllUsersQuery(undefined, {
        pollingInterval: 600000,  // 10 minutes
    })
    
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
            <table className='users-table'>
                <thead>
                    <tr className='users-table__header-tr'>{headerComps}</tr>
                </thead>
                <tbody>
                    {Object.entries(data.entities).map(user => (
                        <UsersRow key={user[1].id} headers={headers} user={user[1]} />
                    ))}
                </tbody>
            </table>
    }

  return (
    <section className="users-table__section">
        <button className='refetch-btn cursor_pointer' onClick={refetch} disabled={isFetching}>
            {isFetching ? 'Refreshing...' : 'Refresh Data'}
        </button>

        {content}        
        
    </section>
  )
}

export default UsersTable