import React, { useRef } from "react";
import {
  Viewer,
  CameraFlyTo,
  CesiumComponentRef,
  Billboard,
  BillboardCollection,
  Entity,
  BillboardGraphics,
} from "resium";

import {
  Cartesian3,
  createWorldTerrain,
  Viewer as CesiumViewer,
  Transforms,
  Color,
  HeightReference,
} from "cesium";

// import rover from "./assets/icons/rover-birdseye.jpg";
import homeMarker from "./assets/icons/marker-home.png";
import marker from "./assets/icons/marker-shadow.png";
import rover from "./assets/icons/rover.svg";

export const terrainProvider = createWorldTerrain();
// export const centerPosition = Cartesian3.fromDegrees(-75.59777, 40.03883);
export const centerPosition = Cartesian3.fromDegrees(
  151.210757,
  -33.861338,
  800
);

// export const terrainProvider = createWorldTerrain();

// const center = Cartesian3.fromDegrees(-75.59777, 40.03883);
// const positions = [
//   new Cartesian3(-75, 35, 0),
//   new Cartesian3(-125, 35, 0),
//   new Cartesian3(-125, 135, 0),
// ];

// latitude: -338597175
// longitude: 1512093746

// latitude: -338595837
// longitude: 1512093957

const billboardGraphic = {
  scale: 0.1,
  show: true,
  image: rover,
  width: 400,
  height: 400,
  heightReference: HeightReference.CLAMP_TO_GROUND,
};

const Map3DView = () => {
  const mapRef = useRef<CesiumComponentRef<CesiumViewer>>(null);
  return (
    <Viewer
      full
      terrainProvider={terrainProvider}
      infoBox={false}
      selectionIndicator={false}
      ref={mapRef}
    >
      <Entity position={centerPosition} billboard={billboardGraphic} />
      {/* <BillboardGraphics
          scale={1}
          show={true}
          image={marker}
          width={26}
          height={26}
          heightReference={HeightReference.CLAMP_TO_GROUND}
        /> */}
      {/* <BillboardCollection
        modelMatrix={Transforms.eastNorthUpToFixedFrame(centerPosition)}
      >
        <Billboard
          color={Color.ORANGE}
          position={Cartesian3.fromDegrees(151.2093957, -33.8595837, 100)}
          image={homeMarker}
          scale={0.1}
        />
        <Billboard
          color={Color.YELLOW}
          position={Cartesian3.fromDegrees(151.2093746, -33.8597175, 100)}
          image={marker}
          scale={0.1}
        />
      </BillboardCollection> */}

      <CameraFlyTo duration={0} destination={centerPosition} />
    </Viewer>
  );
};

export default Map3DView;
