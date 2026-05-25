import { createSlice } from "@reduxjs/toolkit";

const modalSlice = createSlice({
  name: "modal",
  initialState: {
    type: null,     // e.g. "videoPlayer", "register"
    props: {},      // optional data for modal
  },
  reducers: {
    openModal: (state, action) => {
      state.type = action.payload.type;
      state.props = action.payload.props || {};
    },
    closeModal: (state) => {
      state.type = null;
      state.props = {};
    },
  },
});

export const { openModal, closeModal } = modalSlice.actions;
export default modalSlice.reducer;