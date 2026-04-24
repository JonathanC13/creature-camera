import { configureStore } from '@reduxjs/toolkit'
// reducers
import authReducer from '../features/auth/authSlice'
import videoReducer from '../features/videoPlayer/videoSlice'
import { apiSlice } from './apiSlice'

export default store = configureStore({
    reducer: {
        auth: authReducer,
        video: videoReducer,
        // api
        [apiSlice.reducerPath]: apiSlice.reducer,
        //[authApiSlice.reducerPath]: authApiSlice.reducer,
    },
    middleware: getDefaultMiddleware => 
        getDefaultMiddleware()
          .concat(apiSlice.middleware)  // the API slice generates a custom middleware that needs to be added to the store. This middleware must be added as well - it manages cache lifetimes and expiration
        //   .concat(authApiSlice.middleware)
})