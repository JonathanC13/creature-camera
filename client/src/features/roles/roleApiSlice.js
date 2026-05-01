import { createEntityAdapter, createSelector } from '@reduxjs/toolkit'
import { apiSlice, providesList } from '../../app/apiSlice'

const rolesAdapter = createEntityAdapter()
const initialState = rolesAdapter.getInitialState()

const apiSliceWithRoles = apiSlice.injectEndpoints({
    endpoints: builder => ({
        getRoles: builder.query({
            query: () => ({
                method: 'GET',
                url: '/role',
            }),
            providesTags: (result, error) => {
                return providesList(result.response, 'Role')
            },
            transformResponse: (result, meta, arg) => {
                // Here to flatten then normalized into an EntityAdapter
                return rolesAdapter.setAll(initialState, result.response)
            }
        }),
        getRole: builder.query({
            query: (id) => ({
                method: 'GET',
                url: `/role/${id}`
            }),
            invalidatesTags: (result) => {
                return result
                    ? [{ type: 'Role', id }]
                    : []
            }
        })
    })
})

export const selectRolesResult = apiSliceWithRoles.endpoints.getRoles.select()
const selectRolesData = createSelector(
    selectRolesResult,
    (result) => result.data ?? initialState
)

export const { selectAll: selectAllRoles, selectById: selectRoleById } = rolesAdapter.getSelectors(selectRolesData)

export const { useGetRolesQuery, useGetRoleQuery } = apiSliceWithRoles