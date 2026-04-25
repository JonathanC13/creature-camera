import React from 'react'
import UsersRow from './UsersRow'
import { useGetAllUsersQuery } from './userApiSlice'

const UsersTable = () => {

    const headers = new Map[
        ['name', 'name'],
        ['email', 'email'], 
        ['roleName', 'role']
    ]
    const headerComps = new Array()
    for (const [k, v] of headers) {
        headerComps.push(<th className='users-table__header-tr-th'>{v}</th>)
    }
    headerComps.push(<th className='users-table__header-tr-th'></th>)

    const {data, refetch, isFetching, isLoading, isError} = useGetAllUsersQuery(undefined, {
        pollingInterval: 600000,  // 10 minutes
    })

  return (
    <section className="users-table__section">
        <button onClick={refetch} disabled={isFetching}>
            {isFetching ? 'Refreshing...' : 'Refresh Data'}
        </button>

        {(isLoading) && 
            <div className={(isLoading || isFetching) ? "loading__div" : "offscreen"}>
            {
                (isLoading) ? 
                <div className="loader"></div> :
                <></>
            }
            </div>
        }
        
        <table className='users-table'>
            <tr className='users-table__header-tr'>{headerComps}</tr>
            {data.map(user => (
                <UsersRow key={user.id} headers={headers} user={user} />
            ))}
        </table>
    </section>
  )
}

export default UsersTable