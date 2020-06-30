import React from "react";
import { hot } from "react-hot-loader/root";

import LogPx4 from "./LogPx4";
// import Map3DView from "./Map3DView";
// import EntityModel from "./EntityModel";
// import EntityWall from "./assets/EntityWall";

import "./App.css";

function App() {
  return (
    <div className="App">
      <LogPx4 />
      {/* <Map3DView /> */}
      {/* <EntityModel /> */}
      {/* <EntityWall /> */}
    </div>
  );
}

export default hot(App);
