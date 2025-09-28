import React from "react";
import Globe from "./components/Globe";

console.log("API Base URL:", process.env.REACT_APP_API_BASE);

function App() {
  return (
    <div style={{ width: "100%", height: "100vh" }}>
      <Globe />
    </div>
  );
}

export default App;
