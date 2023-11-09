import "bootstrap/dist/css/bootstrap.min.css";
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./components/App";
import Providers from "./components/Providers";

const rootDiv = document.createElement("div");
rootDiv.id = "app";
document.body.appendChild(rootDiv);
const root = createRoot(rootDiv);
root.render(<Providers><App /></Providers>);
