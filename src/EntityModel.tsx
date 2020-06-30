import React from "react";
import { Entity, ModelGraphics, Viewer } from "resium";
import { Cartesian3, createWorldTerrain } from "cesium";

import glb from "./assets/models/Cesium_Air.glb";

const terrainProvider = createWorldTerrain();
const centerPosition = Cartesian3.fromDegrees(151.210757, -33.861338, 1200);

const EntityModel = () => {
  console.log(glb);
  return (
    <Viewer terrainProvider={terrainProvider} full>
      <Entity
        name="ModelGraphics"
        description="ModelGraphics!!"
        position={centerPosition}
      >
        <ModelGraphics uri={glb} minimumPixelSize={128} maximumScale={20000} />
      </Entity>
    </Viewer>
  );
};

export default EntityModel;
