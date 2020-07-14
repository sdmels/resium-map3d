import React, { useRef, useEffect, useState } from "react";
import axios from "axios";
import { Viewer, CesiumComponentRef, Globe } from "resium";
import { Viewer as CesiumViewer, createWorldTerrain, Math } from "cesium";

axios.defaults.headers.post["Content-Type"] = "application/json;charset=utf-8";
axios.defaults.headers.post["Access-Control-Allow-Origin"] = "*";

const terrainProvider = createWorldTerrain();

const getFlightRadar = (): Promise<Response> => {
  const url = `https://data-live.flightradar24.com/zones/fcgi/feed.js
    ?bounds=-33.69,-34.69,149.56,150.84
    &faa=1&satellite=1&mlat=1&flarm=1&adsb=1&gnd=1&air=1
    &vehicles=1&estimated=1&maxage=14400&gliders=1&stats=1
    &enc=XF34kR5ZABmQtQBOQkrC5lmI5loiXuKcCa9EsWnil6M`;

  return axios.get(url);
};

const FlightRadar = () => {
  const mapRef = useRef<CesiumComponentRef<CesiumViewer>>(null);

  useEffect(() => {
    Math.setRandomNumberSeed(3);
    getFlightRadar()
      .then((res) => {
        console.log("flight details", res);
      })
      .catch((e) => console.log("fetch error", e));
  }, []);

  const viewer = mapRef.current?.cesiumElement;

  console.log(viewer);

  return (
    <Viewer
      full
      terrainProvider={terrainProvider}
      infoBox={false}
      selectionIndicator={false}
      shouldAnimate={true}
      ref={mapRef}
    >
      <Globe enableLighting={true} depthTestAgainstTerrain={true} />
    </Viewer>
  );
};

export default FlightRadar;
