import React from 'react'
import { useState, useEffect } from 'react'
import { Outlet, Navigate } from 'react-router'
import useRefreshToken from '../hooks/useRefreshToken'
import { useSelector, useDispatch } from 'react-redux'
import { errorStatusSet, errorStatusCleared } from '../features/error/errorSlice'
import errorTextConversion from '../functions/errorTextConversion'

const PersistentLogin = () => {
    const dispatch = useDispatch()
    const auth = useSelector(state => state.auth)
    const { trigger, token, isError, error, isFetching, isLoadingRefresh } = useRefreshToken()
    const { status } = useSelector(state => state.error)
    
    useEffect(() => {
        let isMounted = true
        
        const verifyRefreshToken = () => {
            trigger()
        }

        if (Boolean(auth.userInfo?.persistentLogin) && auth.userInfo?.token === undefined) {
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
        {status === 'Server error' ?
            <Navigate to="/error" replace />
            :
            Boolean(auth.userInfo?.persistentLogin) && (isLoadingRefresh || isFetching) ?
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