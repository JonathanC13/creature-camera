import { createEntityAdapter, EntityState } from '@reduxjs/toolkit'
import { apiSlice } from '../../app/apiSlice'

const videosAdapter = createEntityAdapter()
const initialState = videosAdapter.getInitialState()

const apiSliceWithVideos = apiSlice.injectEndpoints({
    endpoints: builder => ({
        getSubVideos: builder.query({
            query: () => ({
                method: 'GET',
                URL: '/videos'
            }),
            transformResponse(result, meta, arg) {
                return videosAdapter.setAll(initialState, result.response)
            }
        }),
    })
})

export const selectVideosResult = apiSliceWithVideos.endpoints.getSubVideos.select()
const selectVideosData = createSelector(
    selectVideosResult,
    (result) => result.data ?? initialState
)

export const { selectAll: selectAllVideos, selectById: selectVideoById } = videosAdapter.getSelectors(selectVideosData)

export const { useGetSubVideosQuery } = apiSliceWithVideos