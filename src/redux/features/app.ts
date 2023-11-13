import { type PayloadAction, createSlice } from "@reduxjs/toolkit";

interface AppState {
  activeRoom: string | null,
  onlineContactIds: string[],
}

const initialState: AppState = {
  activeRoom: null,
  onlineContactIds: [],
};

const app = createSlice({
  name: "app",
  initialState,
  reducers: {
    activateRoom(state, action: PayloadAction<string>) {
      state.activeRoom = action.payload;
    },
    addOnlineContact(state, action: PayloadAction<string>) {
      state.onlineContactIds = Array.from(new Set([...state.onlineContactIds, action.payload]));
    },
    removeOnlineContact(state, action: PayloadAction<string>) {
      state.onlineContactIds = state.onlineContactIds.filter(c => c !== action.payload);
    },
  },
});

export const { activateRoom, addOnlineContact, removeOnlineContact } = app.actions;

export default app.reducer;
