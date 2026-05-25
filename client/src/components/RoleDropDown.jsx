import React from 'react'
import { useMemo } from 'react'
import { useGetRolesQuery, selectAllRoles } from '../features/roles/roleApiSlice'
import { useSelector } from 'react-redux'

const createOptionComponents = (rolesData) => {
    const comps = rolesData.map((role) => {
        return <option
            key={role.id}
            value={role.id}
        >
            {role.roleName}
        </option>
    })

  return comps
}

const RoleDropDown = ({
    roleId = '',
    setRoleIdCB,
    disabled = false
}) => {
    const {
        data,
        isError,
    } = useGetRolesQuery()
    
    // const rolesInfo = useSelector(selectAllRoles)
    const sortedRoles = useMemo(() => {
        const sortedRoles = []
        if (data?.entities) {
            for (let [key, val] of Object.entries(data?.entities)) {
                sortedRoles.push(val)
            } 
            
            sortedRoles.sort((a, b) => b.roleLevel - a.roleLevel)
        }
        
        return sortedRoles
    }, [data])  // memo the original data

  return (
    <section className="role-drop-down">
        <label className='role-drop-down__label' htmlFor="roles">role: </label>
        {isError || (sortedRoles !== undefined && sortedRoles.length === 0) ? 
            <p>Error</p> :
            <select className='role-drop-down__select' name="roles" id="roles"
                value={roleId}
                onChange={(e) => (setRoleIdCB(e.target.value))}
                disabled={disabled}
            >
                <option value="" disabled hidden>Choose an option</option>
                {createOptionComponents(sortedRoles)}
            </select>
        }
    </section>
  )
}

export default RoleDropDown