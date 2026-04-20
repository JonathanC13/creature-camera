import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    userInfo: {
        persistentLogin: localStorage.getItem('persistentLogin') || false,
    },
    token: null,
    authMessage: ''
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
            state.token = action.payload.token ?? null
        },
        authMsgSet: (state, action) => {
            state.authMessage = action.payload
        },
        loggedOut: state => {
            state.userInfo = {}
            state.token = null
            localStorage.setItem('persistentLogin', false)
        },
    }
})

export const { userInfoSet, persistenLoginSet, tokenSet, authMsgSet, loggedOut} = authSlice.actions

export default authSlice.reducer