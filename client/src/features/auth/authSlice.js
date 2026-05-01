import { createSlice } from "@reduxjs/toolkit";

const persist = localStorage.getItem('persistentLogin')

const initialState = {
    userInfo: {
        // id, name, email
        persistentLogin: persist === undefined ? persist : true,
    },
    authMessage: ''
}

export const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        userInfoSet: (state, action) => {
            const { persistentLogin } = action.payload.persistentLogin ?? state.userInfo.persistentLogin
            localStorage.setItem('persistentLogin', persistentLogin)
            state.userInfo = { ...state.userInfo, ...action.payload}
        },
        persistentLoginSet: (state, action) => {
            const { persistentLogin } = action.payload ?? false
            state.userInfo.persistentLogin = persistentLogin
            localStorage.setItem('persistentLogin', persistentLogin)
        },
        tokenSet: (state, action) => {
            state.userInfo.token = action.payload
        },
        authMessageSet: (state, action) => {
            state.authMessage = action.payload
        },
        loggedOut: state => {
            state.userInfo = {}
            localStorage.setItem('persistentLogin', false)
        },
    }
})

export const { userInfoSet, persistentLoginSet, authMessageSet, loggedOut, tokenSet} = authSlice.actions

export default authSlice.reducer