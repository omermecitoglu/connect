import { type PayloadAction, createSlice } from "@reduxjs/toolkit";
import type { Contact } from "~/core/contacts";
import type { IMessage } from "bootstrap-chat-ui";

interface DatabaseState {
  contacts: Contact[],
  contactsLoaded: boolean,
  messages: IMessage[],
  messagesLoaded: boolean,
}

const initialState: DatabaseState = {
  contacts: [],
  contactsLoaded: false,
  messages: [],
  messagesLoaded: false,
};

const database = createSlice({
  name: "database",
  initialState,
  reducers: {
    loadContacts(state, action: PayloadAction<Contact[]>) {
      state.contacts = action.payload;
      state.contactsLoaded = true;
    },
    addContact(state, action: PayloadAction<Contact>) {
      const found = state.contacts.find(contact => contact.id === action.payload.id);
      state.contacts = found ? state.contacts : [...state.contacts, action.payload];
    },
    updateContact(state, action: PayloadAction<Contact>) {
      state.contacts = state.contacts.map(contact => contact.id === action.payload.id ? action.payload : contact);
    },
    deleteContact(state, action: PayloadAction<string>) {
      state.contacts = state.contacts.filter(contact => contact.id !== action.payload);
    },
    loadMessages(state, action: PayloadAction<IMessage[]>) {
      state.messages = action.payload;
      state.messagesLoaded = true;
    },
    addMessage(state, action: PayloadAction<IMessage>) {
      const found = state.messages.find(message => message.id === action.payload.id);
      state.messages = found ? state.messages : [...state.messages, action.payload];
    },
    updateMessage(state, action: PayloadAction<IMessage>) {
      state.messages = state.messages.map(message => message.id === action.payload.id ? action.payload : message);
    },
    deleteMessage(state, action: PayloadAction<string>) {
      state.messages = state.messages.filter(message => message.id !== action.payload);
    },
  },
});

export const {
  loadContacts, addContact, updateContact, deleteContact,
  loadMessages, addMessage, updateMessage, deleteMessage,
} = database.actions;

export default database.reducer;
