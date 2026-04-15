import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    userInfo: {
        persistentLogin: localStorage.getItem('persistentLogin') || false,
    },
    token: null
}

export const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        userInfoSet: (state, action) => {
            const { persistentLogin } = action.payload.persistentLogin ?? false
            localStorage.setItem('persistentLogin', persistentLogin)

            state.userInfo = {...action.payload.userInfo}
            state.token = action.payload.token ?? null
        },
        persistenLoginSet: (state, action) => {
            const { persistentLogin } = action.payload.persistentLogin ?? false
            state.userInfo.persistentLogin = persistentLogin
            localStorage.setItem('persistentLogin', persistentLogin)
        },
        tokenSet: (state, action) => {
            state.token = token = action.payload.token ?? null
        },
        loggedOut: state => {
            state.userInfo = {}
            state.token = null
            localStorage.setItem('persistentLogin', false)
        },
    }
})

export const { userInfoSet, persistenLoginSet, tokenSet, loggedOut} = authSlice.actions

export default authSlice.reducer