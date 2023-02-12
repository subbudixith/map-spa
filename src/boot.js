import React, { Suspense } from "react";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { store } from "./store/rootStore";

/**
 *  Boot Component
 */
export default function Boot() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Suspense fallback={"Loading"}>
          <App />
        </Suspense>
      </BrowserRouter>
    </Provider>
  );
}
