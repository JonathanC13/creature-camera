import React from 'react'
import { useState, useEffect } from 'react'
import { Outlet, Navigate } from 'react-router'
import useRefreshToken from '../hooks/useRefreshToken'
import { useSelector, useDispatch } from 'react-redux'
import { errorStatusSet, errorStatusCleared } from '../features/error/errorSlice'
import errorTextConversion from '../functions/errorTextConversion'

const PersistentLogin = () => {
    const dispatch = useDispatch()
    const { authInfo } = useSelector(state => state.auth)
    const persistentLogin = userInfo.persistentLogin
    const { trigger, token, isError, error, isFetching } = useRefreshToken()
    const { status } = useSelector(state => state.errorState)

    useEffect(() => {
        let isMounted = true

        const verifyRefreshToken = () => {
            trigger()
        }

        // console.log(persistentLogin, authInfo)
        if (persistentLogin && !authInfo?.token) {
            verifyRefreshToken()
        }

        const cleanUp = () => {
            isMounted = false
        }
        return cleanUp
    }, [])

    useEffect(() => {
        if (isError) {
            dispatch(errorStatusSet(errorTextConversion(error)))
        } else {
            dispatch(errorStatusCleared())
        }
    }, [isError])

    // console.log(status)
    // useEffect(() => {
    //     console.log(`isLoadingRefresh ${isLoadingRefresh}`)
    //     console.log(`token: ${token}`)
    //     console.log('persistent: ', credentials)
    // }, [isLoadingRefresh])

    // console.log(isLoadingRefresh, ' ', isFetching)
  return (
    <>
        {isError ?
            <Navigate to="/error" replace />
            :
            persistentLogin && (isFetching) ?
                <div className='persistent-login-loading__div'>
                    <section className='persistent-login-loading__section'>
                        <h1 className='persistent-login-loading__h1'>Is loading...</h1>
                    </section>
                </div>
                :
                <Outlet></Outlet>
        }
    </>
  )
}

export default PersistentLogin