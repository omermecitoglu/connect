import { type PayloadAction, createSlice } from "@reduxjs/toolkit";

interface UserState {
  id: string | null,
  avatar: string,
  name: string,
}

const initialState: UserState = {
  id: null,
  avatar: "",
  name: "",
};

const user = createSlice({
  name: "user",
  initialState,
  reducers: {
    identifyUser: (state, action: PayloadAction<{ id: string, avatar: string, name: string }>) => {
      state.id = action.payload.id;
      state.avatar = action.payload.avatar;
      state.name = action.payload.name;
    },
  },
});

export const { identifyUser } = user.actions;

export default user.reducer;
