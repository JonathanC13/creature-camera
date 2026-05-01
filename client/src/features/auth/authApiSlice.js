import { apiSlice } from '../../app/apiSlice'

// Sync with a Standard Redux Slice to maintain logged in user info.
export const apiSliceWithAuth = apiSlice.injectEndpoints({
  endpoints: builder => ({
    login: builder.mutation({
        query: (credentials) => ({
            method: 'POST',
            url: '/auth/login',
            body: {...credentials}
        }),
        invalidatesTags: (result) => (result ? ['UNAUTHORIZED'] : []),
    }),
    logout: builder.mutation({
        query: (credentials) => ({
            method: 'POST',
            url: '/auth/logout',
            body: {...credentials}
        }),
        async onQueryStarted(arg, {dispatch, queryFulfilled}) { // optimistic, update cache of other endpoints.
            // callback for query
            try {
                const {data} = await queryFulfilled

                dispatch(loggedOut())
                dispatch(apiSliceWithAuth.util.resetApiState()) // clear the cache of this apiSlice
            } catch (err) {
                // console.log(err)
            }
        }
    }),
    forgotPassword: builder.mutation({
        query: (credentials) => ({
            method: 'POST',
            url: '/auth/forgotPassword',
            body: {...credentials}
        })
    }),
    validateOTP: builder.mutation({
        query: (credentials) => ({
            method: 'POST',
            url: '/auth/validateOTP',
            body: {...credentials}
        })
    }),
    updatePassword: builder.mutation({
        query: (user) => ({
            method: 'PATCH',
            url: `/auth/updatePassword/${user.id}`,
            body: {...user.userInfo}
        })
    }),
    updateUserInfo: builder.mutation({
        query: (user) => ({
            method: 'PATCH',
            url: `/auth/updateUserInfo/${user.id}`,
            body: {...user.userInfo}
        })
    }),
    refreshToken: builder.query({
        query: () => ({
            method: 'GET',
            url: '/auth/refreshToken'
        }),
    }),
  })
})

export const { useLoginMutation, useLogoutMutation, useForgotPasswordMutation, useValidateOTPMutation, useUpdatePasswordMutation, useUpdateUserInfoMutation, useLazyRefreshTokenQuery } = apiSliceWithAuth