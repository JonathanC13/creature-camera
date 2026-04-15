import { createEntityAdapter, EntityState } from '@reduxjs/toolkit'
import { apiSlice, providesList } from '../../app/apiSlice'

const usersAdapter = createEntityAdapter()
const initialState = usersAdapter.getInitialState()

export const apiSliceWithUsers = apiSlice.injectEndpoints({
    endpoints: builder => ({
        getAllUsers: builder.query({
            query: () => ({
                method: 'GET',
                url: '/user',
            }),
            providesTags: (result, error) => {
                return providesList(result, 'User')
            },
            transformResponse: (response, meta, arg) => {
                // transform to put into entity adapter so the response Array of objects can normalized to {id, userinfo: {}}
                return usersAdapter.setAll(initialState, response.response)
            }
        }),
        getUser: builder.query({
            query: (id) => ({
                method: 'GET',
                url: `/user/${id}`
            }),
            providesTags: (result, error, id) => {
                return result
                ? [{ type: 'User', id }]
                : []
            }
        }),
        register: builder.mutation({
            query: (userInfo) => ({
                method: 'POST',
                url: '/user',
                body: {...userInfo}
            }),
            invalidatesTags: (result, error, id) => {
                // for re-fetch all users
                return [{ type: 'User', id: 'LIST' }]
            }
        }),
        updateUser: builder.mutation({
            query: (userInfo) => ({
                method: 'PATCH',
                url: `/user/${userInfo.id}`,
                body: {...userInfo.updateInfo}
            }),
            invalidatesTags: (result, error, userInfo) => {
                return [{ type: 'User', id: userInfo.id }]
            }
        }),
        adminResetPassword: builder.mutation({
            query: (id) => ({
                method: 'PATCH',
                url: `/user/${id}`
            })
        }),
        deleteUser: builder.mutation({
            query: (id) => ({
                method: 'DELETE',
                url: `/user/${id}`
            }),
            invalidatesTags: (result, error) => {
                return [{ type: 'User', id: 'LIST' }]
            }
        }),
    })
})

// Where the data is cached
export const selectUsersResult = apiSliceWithUsers.endpoints.getAllUsers.select()
const selectUsersData = createSelector( // memoized. Use in apiSlice for lookups of the cached data. Use in components to reduce re-renders.
  selectUsersResult,    // inputs
  // Fall back to the empty entity state if no response yet.
  result => result.data ?? initialState // result function. result = selectUsersResult
)

export const { selectAll: selectAllUsers, selectById: selectUserById } = usersAdapter.getSelectors(selectUsersData) // getSelectors generate selectAll, selectById

export const { useGetAllUsersQuery, useGetUserQuery, useRegisterMutation, useUpdateUserMutation, useAdminResetPasswordMutation, useDeleteUserMutation } = apiSliceWithUsers