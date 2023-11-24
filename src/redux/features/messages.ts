import { type PayloadAction, createSlice } from "@reduxjs/toolkit";
import type { IMessage } from "@omer-x/bootstrap-chat-ui";

interface MessagesState {
  collection: IMessage[],
  loaded: boolean,
}

const initialState: MessagesState = {
  collection: [],
  loaded: false,
};

const messages = createSlice({
  name: "messages",
  initialState,
  reducers: {
    loadMessages(state, action: PayloadAction<IMessage[]>) {
      state.collection = [...action.payload, ...state.collection];
      state.loaded = true;
    },
    addMessage(state, action: PayloadAction<IMessage>) {
      const found = state.collection.find(message => message.id === action.payload.id);
      state.collection = found ? state.collection : [...state.collection, action.payload];
    },
    addMessages(state, action: PayloadAction<IMessage[]>) {
      const unsavedMessages = action.payload.filter(m => !state.collection.find(msg => msg.id === m.id));
      state.collection = [...state.collection, ...unsavedMessages];
    },
    updateMessage(state, action: PayloadAction<IMessage>) {
      state.collection = state.collection.map(message => message.id === action.payload.id ? action.payload : message);
    },
    updateMessages(state, action: PayloadAction<IMessage[]>) {
      state.collection = state.collection.map(message => action.payload.find(msg => msg.id === message.id) ?? message);
    },
    deleteMessage(state, action: PayloadAction<string>) {
      state.collection = state.collection.filter(message => message.id !== action.payload);
    },
  },
});

export const { loadMessages, addMessage, addMessages, updateMessage, updateMessages, deleteMessage } = messages.actions;

export default messages.reducer;
