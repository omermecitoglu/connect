import { type PayloadAction, createSlice } from "@reduxjs/toolkit";

interface AppState {
  activeRoom: string | null,
}

const initialState: AppState = {
  activeRoom: null,
};

const app = createSlice({
  name: "app",
  initialState,
  reducers: {
    activateRoom(state, action: PayloadAction<string>) {
      state.activeRoom = action.payload;
    },
  },
});

export const { activateRoom } = app.actions;

export default app.reducer;
