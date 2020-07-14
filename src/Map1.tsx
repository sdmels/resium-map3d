import React, { useRef, useEffect, useState } from "react";
import {
  Viewer,
  CesiumComponentRef,
  Globe,
  Entity,
  ModelGraphics,
} from "resium";
import {
  Viewer as CesiumViewer,
  createWorldTerrain,
  Math,
  SampledPositionProperty,
} from "cesium";

import AirBus from "./assets/models/Cesium_Air.glb";
import { FlightRadar, Flight } from "./model";

const terrainProvider = createWorldTerrain();

const flightRadar = () => {
  return fetch("/zones/fcgi/feed.js");
};

const Map1 = () => {
  const mapRef = useRef<CesiumComponentRef<CesiumViewer>>(null);
  const [vehicleParameters, setVehicleParameters] = useState<Flight>();
  const [property, setProperty] = useState<SampledPositionProperty>(
    new SampledPositionProperty()
  );
  //   const [entity, setEntity] = useState<any>();

  useEffect(() => {
    Math.setRandomNumberSeed(3);

    // flightRadar()
    //   .then((response) => response.json())
    //   .then((flights: any) => {
    //     debugger;
    //     console.log(flights);
    //     // const activeFlights = flights.data.filter(
    //     //   (flight: Flight) => !!flight?.live
    //     // );

    //     // if (activeFlights[0]) {
    //     //   setVehicleParameters(activeFlights[0].live);
    //     // }
    //   });
  }, []);

  useEffect(() => {
    if (!vehicleParameters) {
      return;
    }

    console.log("parameters", vehicleParameters);
  }, [vehicleParameters]);

  const viewer = mapRef.current?.cesiumElement;
  if (!viewer) {
    return <></>;
  }
  console.log(viewer, AirBus);
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

      <Entity position={property}>
        <ModelGraphics uri={AirBus} minimumPixelSize={64} />
      </Entity>
    </Viewer>
  );
};

export default Map1;
