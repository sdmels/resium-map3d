import React from "react";
import { Entity, WallGraphics, Viewer } from "resium";
import { Cartesian3, createWorldTerrain, Color } from "cesium";

const terrainProvider = createWorldTerrain();
// const centerPosition = Cartesian3.fromDegrees(151.210757, -33.861338, 1200);

const EntityWall = () => {
  return (
    <div>
      <Viewer terrainProvider={terrainProvider} full>
        <Entity
          name="WallGraphics"
          description="WallGraphics!!"
          position={Cartesian3.fromDegrees(-74.0707383, 40.7117244, 100)}
        >
          <WallGraphics
            positions={Cartesian3.fromDegreesArray([
              -115.0,
              50.0,
              -112.5,
              50.0,
              -110.0,
              50.0,
              -107.5,
              50.0,
              -105.0,
              50.0,
              -102.5,
              50.0,
              -100.0,
              50.0,
              -97.5,
              50.0,
              -95.0,
              50.0,
              -92.5,
              50.0,
              -90.0,
              50.0,
            ])}
            maximumHeights={[
              100000,
              200000,
              100000,
              200000,
              100000,
              200000,
              100000,
              200000,
              100000,
              200000,
              100000,
            ]}
            minimumHeights={[
              0,
              100000,
              0,
              100000,
              0,
              100000,
              0,
              100000,
              0,
              100000,
              0,
            ]}
            material={Color.BLUE.withAlpha(0.5)}
            outline
            outlineColor={Color.BLACK}
          />
        </Entity>{" "}
      </Viewer>
    </div>
  );
};

export default EntityWall;
