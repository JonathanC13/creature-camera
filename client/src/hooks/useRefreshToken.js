import { useLazyRefreshTokenQuery } from "../features/auth/authApiSlice"
import { userInfoSet } from '../features/auth/authSlice'
import { useSelector, useDispatch } from "react-redux"
import { useState, useEffect } from 'react'

const useRefreshToken = () => {
    const auth = useSelector(state => state.auth)
    const dispatch = useDispatch()
    const [isLoadingRefresh, setIsLoadingRefresh] = useState(true)

    const [trigger, {
          data,
          refetch,
          isLoading,
          isFetching,
          isSuccess,
          isError,
          error
        }] = useLazyRefreshTokenQuery()

    useEffect(() => {
        setIsLoadingRefresh(true)
        if (!isFetching && isSuccess) {
            // Using JWT cookie, refetch user info
            const payload = {...data.user, token: data.token}
            dispatch(userInfoSet(payload))
        }
        if (!isFetching) {
            setIsLoadingRefresh(false)
        }
    }, [isFetching, setIsLoadingRefresh])

    return {trigger, token: data?.token, isError, error, isFetching, refetch, isLoadingRefresh} 
}

export default useRefreshToken