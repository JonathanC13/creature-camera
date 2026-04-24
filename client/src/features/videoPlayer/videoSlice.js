import { createSlice } from "@reduxjs/toolkit";

const url = import.meta.env.VITE_BACKEND_URL
const route = 'video/src/'

const initialState = {
    videoParams = {
        id: null,
        filename: null,
        src: ''
    },
    hidden: true
}

export const videoSlice = createSlice({
    name: "video",
    initialState,
    reducers: {
        videoParamsSet: (state, action) => {
            state.videoParams.id = action.payload.id ?? null
            state.videoParams.filename = action.payload.filename ?? null
            state.videoParams.src = url + route + `?id=${id}&filename=${filename}`
        },
        hiddenSet: (state, action) => {
            state.hidden = action.payload.hidden ?? true
        },
        videoClosed: (state, action) => {
            state.videoParams.id = null
            state.videoParams.filename = null
            state.videoParams.src = ''
            state.hidden = true
        }
    }
})

export const { videoParamsSet, hiddenSet, videoClosed} = videoSlice.actions

export default videoSlice.reducer