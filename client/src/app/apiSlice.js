import { createApi, fetchBaseQuery, retry } from '@reduxjs/toolkit/query/react'
import { tokenSet, loggedOut } from '../features/auth/authSlice'

const url = import.meta.env.VITE_BACKEND_URL //'http://localhost:5000/api/v1/' // import.meta.env.REACT_APP_BE_URL + '/auth' || 

const baseQuery = retry(fetchBaseQuery({
    baseUrl: url,
    credentials: 'include',
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth.token
  
      // If we have a token set in state, let's assume that we should be passing it.
      if (token) {
        headers.set('authorization', `Bearer ${token}`)
      }
  
      return headers
    }
}), {
  maxRetries: 2,
})

// If token expired, attempt to get new token and retry request.
const baseQueryWithReauth = async (args, api, extraOptions) => {
    let result = await baseQuery(args, api, extraOptions)
    // console.log('0, ', result)
    if (result.error && result.error.status === 401) {
      // console.log('1, ', result.error)
      // try to get a new token
      const refreshResult = await baseQuery('/auth/refreshToken', api, extraOptions)
      if (refreshResult.data?.token) {
        // console.log('2, ', refreshResult)
        // store the new token
        api.dispatch(tokenSet({token: refreshResult.data.token}))
        // retry the initial query
        result = await baseQuery(args, api, extraOptions)
      } else {
        api.dispatch(loggedOut())
      }
    }
    return result
}

// Enter
// Define our single API slice object
export const apiSlice = createApi({
    // The cache reducer expects to be added at `state.api` (already default - this is optional)
    reducerPath: 'api',
    // All of our requests will have URLs starting with
    baseQuery: baseQueryWithReauth,
    // For cached data, so when it is invalidated it will retrieve.
    tagTypes: ['User', 'Camera'], // , 'UNAUTHORIZED']
    // The "endpoints" represent operations and requests for this server
    endpoints: (builder) => ({})
})

export function providesList(resultsWithIds, tagType) {
  return resultsWithIds
    ? [
        { type: tagType, id: 'LIST' },
        ...resultsWithIds.map(({ id }) => { return { type: tagType, id } }),
      ]
    : [{ type: tagType, id: 'LIST' }]
}