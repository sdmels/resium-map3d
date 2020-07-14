import React, { useRef, useState, useEffect } from "react";
import {
  Viewer,
  CesiumComponentRef,
  Clock,
  CameraFlyTo,
  Entity,
  ModelGraphics,
  PointGraphics,
} from "resium";

import {
  createWorldTerrain,
  Viewer as CesiumViewer,
  Cartesian3,
  JulianDate,
  ClockRange,
  Color,
  SampledPositionProperty,
  TimeIntervalCollection,
  TimeInterval,
  VelocityOrientationProperty,
  PolylineGlowMaterialProperty,
} from "cesium";

import AirBus from "./../assets/models/Cesium_Air.glb";

const terrainProvider = createWorldTerrain();
const lat = -33.861338;
const lng = 151.210757;

const centerPosition = Cartesian3.fromDegrees(lng, lat, 2000);

const AirModelOption = {
  uri: AirBus,
  minimumPixelSize: 128,
  maximumScale: 200000,
};

// @ts-ignore
const PathMaterial = new PolylineGlowMaterialProperty({
  // @ts-ignore
  glowPower: 0.1,
  // @ts-ignore
  color: Color.GREENYELLOW,
  // @ts-ignore
  taperPower: 1,
});
const property = new SampledPositionProperty();

const FlyModel = () => {
  const mapRef = useRef<CesiumComponentRef<CesiumViewer>>(null);
  const [start, setStart] = useState<JulianDate>();
  const [stop, setStop] = useState<JulianDate>();

  useEffect(() => {
    const currentDate = JulianDate.fromDate(new Date());
    setStart(currentDate);
    setStop(JulianDate.addSeconds(currentDate, 1000, new JulianDate()));

    // eslint-disable-next-line
  }, [mapRef]);

  if (!(start && stop)) {
    return <></>;
  }

  const handleClockTick = () => {
    const pos1 = Cartesian3.fromDegrees(lng, lat, 0);
    const time1 = JulianDate.addSeconds(start, 0, new JulianDate());
    property.addSample(time1, pos1);

    const pos2 = Cartesian3.fromDegrees(lng + 0.1, lat, 0);
    const time2 = JulianDate.addSeconds(start, 500, new JulianDate());

    property.addSample(time2, pos2);
  };

  return (
    <Viewer
      full
      terrainProvider={terrainProvider}
      infoBox={false}
      selectionIndicator={false}
      shouldAnimate={true}
      trackedEntity={true}
      ref={mapRef}
    >
      <CameraFlyTo duration={2} destination={centerPosition} />

      <Clock
        startTime={start.clone()}
        stopTime={stop.clone()}
        currentTime={start.clone()}
        clockRange={ClockRange.CLAMPED}
        multiplier={10}
        onTick={handleClockTick}
        canAnimate={true}
        shouldAnimate={false}
      />
      <Entity
        position={property}
        availability={
          new TimeIntervalCollection([new TimeInterval({ start, stop })])
        }
        orientation={new VelocityOrientationProperty(property)}
      >
        <ModelGraphics
          uri={AirModelOption.uri}
          maximumScale={AirModelOption.maximumScale}
          minimumPixelSize={AirModelOption.minimumPixelSize}
        />
        {/* <PathGraphics resolution={1} width={10} material={PathMaterial} /> */}
      </Entity>
      <PointGraphics color={Color.GREENYELLOW} pixelSize={5} />
    </Viewer>
  );
};

export default FlyModel;
