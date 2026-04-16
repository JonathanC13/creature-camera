import { createEntityAdapter, EntityState } from '@reduxjs/toolkit'
import { apiSlice, providesList } from '../../app/apiSlice'

const camerasAdapter = createEntityAdapter()
const initialState = camerasAdapter.getInitialState()

const apiSliceWithCameras = apiSlice.injectEndpoints({
    endpoints: builder => ({
        getAllCameras: builder.query({
            query: () => ({
                method: 'GET',
                url: '/camera',
            }),
            providesTags: (result, error) => {
                return providesList(result, 'Camera')
            },
            transformResponse: (result, meta, arg) => {
                // Here to flatten then normalized into an EntityAdapter
                // response: { reponse, count}
                return camerasAdapter.setAll(initialState, result.response)
            }
        }),
        getCamera: builder.query({
            query: (id) => ({
                method: 'GET',
                url: `/camera/${id}`
            }),
            providesTags: (result, error, id) => {
                return result
                    ? [{ type: 'Camera', id }]
                    : []
            }
        }),
        createCamera: builder.mutation({
            query: (cameraInfo) => ({
                method: 'POST',
                url: '/camera',
                body: {...cameraInfo}
            }),
            invalidatesTags: (result, error) => {
                return [{ type: 'Camera', id: 'LIST'}]
            }
        }),
        updateCamera: builder.mutation({
            query: (cameraInfo) => ({
                method: 'PATCH',
                url: `/camera/${cameraInfo.id}`,
                body: {...cameraInfo.updateInfo}
            }),
            invalidatesTags: (result, error, cameraInfo) => {
                return [{ type: 'Camera', id: cameraInfo.id }]
            }
        }),
        deleteCamera: builder.mutation({
            query: (id) => ({
                method: 'DELETE',
                url: `/camera/${id}`
            }),
            invalidatesTags: (result, error) => {
                return [{ type: 'Camera', id: 'LIST' }]
            }
        })
    })
})

export const selectCamerasResult = apiSliceWithCameras.endpoints.getAllCameras.select()
const selectCamerasData = createSelector(
    selectCamerasResult,
    (result) => result.data ?? initialState
)

export const { selectAll: selectAllCameras, selectById: selectCameraById } = camerasAdapter.getSelectors(selectCamerasData)

export const { useGetAllCamerasQuery, useGetCameraQuery, useCreateCameraMutation, useUpdateCameraMutation, useDeleteCameraMutation } = apiSliceWithCameras