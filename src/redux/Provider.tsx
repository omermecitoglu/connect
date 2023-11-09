"use client";
import React, { type ReactNode } from "react";
import { Provider } from "react-redux";
import { store } from "./store";

type ReduxProviderProps = {
  children: ReactNode,
};

const ReduxProvider = ({
  children,
}: ReduxProviderProps) => (
  <Provider store={store}>
    {children}
  </Provider>
);

export default ReduxProvider;
