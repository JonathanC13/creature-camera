import React from 'react'
import { useMemo } from 'react'
import { useGetRolesQuery } from '../features/roles/roleApiSlice'

const createOptionComponents = (rolesData) => {
    const comps = rolesData.map((role) => {
        return <option
            value={role.id}
        >
            {role.roleName}
        </option>
    })

  return comps
}

const RoleDropDown = (
    roleId = null,
    setRoleIdCB
) => {

    const {
        data,
        isError,
    } = useGetRolesQuery()

    const sortedRoles = useMemo(() => {
        const sortedRoles = []
        for (let [key, val] of Object.entries(data.entities)) {
        sortedRoles.push(val)
        } 
        
        sortedRoles.sort((a, b) => b.roleLevel - a.roleLevel)

        setRoleIdCB(sortedRoles[0]['id'])
        return sortedRoles
    }, [data])  // memo the original data

  return (
    <section className="role-drop-down">
        <label for="roles">Roles:</label>
        {isError || sortedRoles.length === 0 ? 
            <p>Error</p> :
            <select name="roles" id="roles"
                value={roleId}
                onChange={(e) => (setRoleIdCB(e.target.value))}
            >
                {createOptionComponents(sortedRoles)}
            </select>
        }
    </section>
  )
}

export default RoleDropDown