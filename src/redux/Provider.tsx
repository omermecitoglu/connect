"use client";
import React, { type ReactNode } from "react";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { persistor, store } from "./store";

type ReduxProviderProps = {
  children: ReactNode,
};

const ReduxProvider = ({
  children,
}: ReduxProviderProps) => (
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      {children}
    </PersistGate>
  </Provider>
);

export default ReduxProvider;
