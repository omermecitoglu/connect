import { type PayloadAction, createSlice } from "@reduxjs/toolkit";
import type { Contact } from "~/core/contacts";

interface ContactsState {
  collection: Contact[],
  loaded: boolean,
}

const initialState: ContactsState = {
  collection: [],
  loaded: false,
};

const contacts = createSlice({
  name: "contacts",
  initialState,
  reducers: {
    loadContacts(state, action: PayloadAction<Contact[]>) {
      state.collection = action.payload;
      state.loaded = true;
    },
    addContact(state, action: PayloadAction<Contact>) {
      const found = state.collection.find(contact => contact.id === action.payload.id);
      state.collection = found ? state.collection : [...state.collection, action.payload];
    },
    updateContact(state, action: PayloadAction<Contact>) {
      state.collection = state.collection.map(contact => contact.id === action.payload.id ? action.payload : contact);
    },
    deleteContact(state, action: PayloadAction<string>) {
      state.collection = state.collection.filter(contact => contact.id !== action.payload);
    },
  },
});

export const { loadContacts, addContact, updateContact, deleteContact } = contacts.actions;

export default contacts.reducer;
