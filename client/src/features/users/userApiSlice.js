import { apiSlice, providesList } from '../../app/apiSlice'

export const apiSliceWithUser = apiSlice.injectEndpoints({
    endpoints: builder => ({
        getAllUsers: builder.query({
            query: () => ({
                method: 'GET',
                url: '/user',
            })
        }), // TODO: transform (just sort), provides tags
        getUser: builder.query({
            query: (id) => ({
                method: 'GET',
                url: `/user/${id}`
            })
        }), // provides tag?
        register: builder.mutation({
            query: (userInfo) => ({
                method: 'POST',
                url: '/user',
                body: {...userInfo}
            })
        }), // invalidates User
        updateUser: builder.mutation({
            query: (userInfo) => ({
                method: 'PATCH',
                url: `/user/${userInfo.id}`,
                body: {...userInfo.updateInfo}
            })
        }), // invalidate User
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
            })
        }), // invalidate User
    })
})

export const { useGetAllUsersQuery, useGetUserQuery, useRegisterMutation, useUpdateUserMutation, useAdminResetPasswordMutation, useDeleteUserMutation } = apiSliceWithUser