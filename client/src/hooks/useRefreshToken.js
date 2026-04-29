import { useLazyUserRefreshTokenQuery } from "../features/auth/authApiSlice"
import { userInfoSet, tokenSet } from '../features/auth/authSlice'
import { useSelector, useDispatch } from "react-redux"
import { useState, useEffect } from 'react'

const useRefreshToken = () => {
    const auth = useSelector(state => state.auth)
    const dispatch = useDispatch()

    const [trigger, {
          data,
          refetch,
          isLoading,
          isFetching,
          isSuccess,
          isError,
          error
        }] = useLazyUserRefreshTokenQuery()

    // useEffect(() => {
    //     if (isFetching) {
    //         console.log('fetcjing')
    //         setIsLoadingRefresh(true)
    //     }
    // }, [isFetching])

    useEffect(() => {
        if (isSuccess) {
            dispatch(userInfoSet({...data.user}))
            dispatch(tokenSet(data?.token))
            // console.log('new token: ', data?.token)
        }
    }, [isSuccess])

    return {trigger, token: data?.token, isError, error, isFetching, refetch} 
}

export default useRefreshToken