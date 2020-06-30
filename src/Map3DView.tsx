import React, { useRef, useEffect, useState } from "react";
import {
  Viewer,
  Globe,
  CesiumComponentRef,
  Clock,
  Entity,
  PathGraphics,
  ModelGraphics,
} from "resium";

import {
  Cartesian3,
  createWorldTerrain,
  Viewer as CesiumViewer,
  Math,
  JulianDate,
  ClockRange,
  SampledPositionProperty,
  Color,
  VelocityOrientationProperty,
  TimeIntervalCollection,
  TimeInterval,
  PolylineGlowMaterialProperty,
  HeadingPitchRange,
  LinearApproximation,
} from "cesium";

import AirBus from "./assets/models/Cesium_Air.glb";

const terrainProvider = createWorldTerrain();

const roverMaterialOptions = {
  glowPower: 0.1,
  color: Color.YELLOW,
};

const Const_POS = [
  { x: -1938882.132435972, y: -4783104.970986614, z: 3738309.9160818686 },
  { x: -1939387.900323652, y: -4781193.261036239, z: 3740070.65716298 },
  {
    x: -1941923.3612027455,
    y: -4779821.267164548,
    z: 3741046.3285450945,
  },
  {
    x: -1944814.3726146347,
    y: -4779323.961685797,
    z: 3740297.3814439983,
  },
  {
    x: -1946353.4244015086,
    y: -4779956.238836014,
    z: 3738233.3529754514,
  },
  { x: -1945750.717271222, y: -4781625.001063456, z: 3736280.714354399 },
  {
    x: -1943370.2943612777,
    y: -4783382.7269118745,
    z: 3735607.1109777773,
  },
  { x: -1940506.515172479, y: -4783950.993914748, z: 3736412.6206093826 },
  {
    x: -1938934.0602408552,
    y: -4783233.073741037,
    z: 3738410.7113252394,
  },
];

const AirModelOption = {
  uri: AirBus,
  minimumPixelSize: 64,
};

const Map3DView = () => {
  const mapRef = useRef<CesiumComponentRef<CesiumViewer>>(null);
  const [startTime, setStartTime] = useState<JulianDate>();
  const [stopTime, setStopTime] = useState<JulianDate>();
  const [waypoints, setWaypoints] = useState<any>([]);
  const [path, setPath] = useState<any>();
  const [property, setProperty] = useState<SampledPositionProperty>(
    new SampledPositionProperty()
  );

  useEffect(() => {
    Math.setRandomNumberSeed(3);
    setStartTime(JulianDate.fromDate(new Date(2015, 2, 25, 16)));
  }, []);

  useEffect(() => {
    if (startTime) {
      const stopClock = JulianDate.addSeconds(startTime, 360, new JulianDate());
      setStopTime(stopClock);
    }
  }, [startTime]);

  const viewer = mapRef.current?.cesiumElement;

  useEffect(() => {
    if (!(startTime && stopTime)) {
      return;
    }

    const computeCircularFlight = (): any => {
      if (!startTime) {
        return null;
      }

      for (let i = 0, ind = 0; i <= 360; i += 45, ind++) {
        const time = JulianDate.addSeconds(startTime, i, new JulianDate());
        const position = Const_POS[ind] as Cartesian3;

        property.addSample(time, position);

        setWaypoints((waypoints: any) =>
          waypoints.concat({
            position: position,
            point: {
              pixelSize: 8,
              color: Color.TRANSPARENT,
              outlineColor: Color.YELLOW,
              outlineWidth: 3,
            },
          })
        );
      }
      return property;
    };

    viewer?.timeline.zoomTo(startTime, stopTime);
    const pos = computeCircularFlight();

    setProperty(pos as any);

    // eslint-disable-next-line
  }, [startTime, stopTime]);

  useEffect(() => {
    if (!(startTime && stopTime && property)) {
      return;
    }

    const roverTimeInterval = new TimeIntervalCollection([
      new TimeInterval({
        start: startTime,
        stop: stopTime,
      }),
    ]);

    const pathEntity = {
      availability: roverTimeInterval,
      position: property,
      orientation: new VelocityOrientationProperty(property),
      model: AirModelOption,
      path: {
        resolution: 1,
        width: 10,
        // @ts-ignore
        material: new PolylineGlowMaterialProperty(roverMaterialOptions),
      },
    };

    setPath(pathEntity);
  }, [startTime, stopTime, property]);

  useEffect(() => {
    if (!path || !viewer) {
      return;
    }

    // @ts-ignore
    path.position.setInterpolationOptions({
      interpolationDegree: 2,
      interpolationAlgorithm: LinearApproximation,
    });

    viewer?.zoomTo(
      viewer.entities,
      new HeadingPitchRange(0, Math.toRadians(-90))
    );
  }, [path, viewer]);

  if (!(startTime && stopTime && waypoints && path)) {
    return null;
  }

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
      <Clock
        startTime={startTime?.clone()}
        stopTime={stopTime.clone()}
        currentTime={startTime.clone()}
        clockRange={ClockRange.LOOP_STOP}
        multiplier={1}
        shouldAnimate={true}
      />

      {waypoints.length > 0 &&
        waypoints.map((waypoint: any, index: number) => (
          <Entity
            key={index}
            position={waypoint.position}
            point={waypoint.point}
          />
        ))}

      {path && (
        <Entity
          position={path.position}
          availability={path.availability}
          orientation={path.orientation}
          tracked={true}
        >
          <ModelGraphics
            uri={path.model.uri}
            maximumScale={20000}
            minimumPixelSize={path.model.minimumPixelSize}
          />
          <PathGraphics
            resolution={path.path.resolution}
            width={path.path.width}
            material={path.path.material}
          />
        </Entity>
      )}
    </Viewer>
  );
};

export default Map3DView;
