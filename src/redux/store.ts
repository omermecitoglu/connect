import { type Reducer, configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/dist/query";
import { persistReducer, persistStore } from "redux-persist";
import thunk from "redux-thunk";
import userReducer from "./features/user";
import storage from "./storage";

function persisted<T>(key: string, reducer: Reducer<T>) {
  return persistReducer<T>({ key: "connect:" + key, storage }, reducer);
}

export const store = configureStore({
  reducer: {
    user: persisted("user", userReducer),
  },
  devTools: process.env.NODE_ENV !== "production",
  middleware: [thunk],
});

setupListeners(store.dispatch);

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
