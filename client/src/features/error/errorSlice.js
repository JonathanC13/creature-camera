import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    status: '',
    message: ''
}

export const errorSlice = createSlice({
    name: 'errorSlice',
    initialState: initialState,
    reducers: {
        errorStatusSet: (state, action) => {
            const { status, message } = action.payload
            state.status = status
            state.message = message
        },
        errorStatusCleared: (state, action) => {
            state.status = ''
            state.message = ''
        }
    }
})

export const { errorStatusSet, errorStatusCleared } = errorSlice.actions

export default errorSlice.reducer