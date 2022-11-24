// index.js

import React from "react";
import { createRoot } from "react-dom/client";
import InputForm from "./InputForm";

const container = document.getElementById("root");
const root = createRoot(container);

// Add InputForm component to the DOM and Logger component to the DOM
root.render(
    <React.StrictMode>
        <InputForm />
    </React.StrictMode>
);


