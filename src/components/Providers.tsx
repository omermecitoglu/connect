import React, { type ReactNode } from "react";
import ReduxProvider from "~/redux/Provider";

type ProvidersProps = {
  children: ReactNode,
};

const Providers = ({
  children,
}: ProvidersProps) => (
  <ReduxProvider>
    {children}
  </ReduxProvider>
);

export default Providers;
