import React from "react";
import { hot } from "react-hot-loader/root";

import LogPx4 from "./LogPx4";
// import Map3DView from "./Map3DView";
// import EntityModel from "./EntityModel";
// import EntityWall from "./assets/EntityWall";
// import Map1 from "./Map1";
// import FlightRadar from "./Radar/FlightRadar";
// import FlyModel from "./FlyModel/FlyModel";

import "./App.css";

function App() {
  return (
    <div className="App">
      {/* <FlyModel /> */}
      <LogPx4 />
      {/* <Map3DView /> */}
      {/* <EntityModel /> */}
      {/* <EntityWall /> */}
      {/* <Map1 /> */}
      {/* <FlightRadar /> */}
    </div>
  );
}

export default hot(App);
