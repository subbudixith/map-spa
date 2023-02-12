import React, { Suspense } from "react";
import Locate from "./components/Pages/Locate";

/**
 * Application Base Component
 */
function App() {
  return (
    <Suspense fallback={"Loading"}>
      <Locate />
    </Suspense>
  );
}

export default App;
