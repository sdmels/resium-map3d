import React, { useEffect, useState, useRef } from "react";

import {
  Viewer as CesiumViewer,
  Math,
  createWorldTerrain,
  JulianDate,
  Cartesian3,
  ClockRange,
  SampledPositionProperty,
  TimeIntervalCollectionProperty,
  Transforms,
  Matrix3,
  Matrix4,
  Quaternion,
  TimeInterval,
  Cartesian4,
  TimeIntervalCollection,
  Color,
  sampleTerrainMostDetailed,
  Cartographic,
} from "cesium";

import {
  Viewer,
  Globe,
  SkyAtmosphere,
  Clock,
  Entity,
  ModelGraphics,
  PathGraphics,
} from "resium";

import AirBus from "./assets/models/Cesium_Air.glb";

import flight_modes from "./constant/LogConst";
import attitude_data from "./constant/attitude_data";
import manual_control_setpoints from "./constant/manual_control_setpoints";
import position_data from "./constant/Position";

const terrainProvider = createWorldTerrain({
  requestVertexNormals: true,
  requestWaterMask: true,
});

const AirModelOption = {
  uri: AirBus,
  minimumPixelSize: 8,
  scale: 1,
};

const LogPx4 = () => {
  const [takeOff, setTakeOff] = useState<{
    alt: number;
    position: Cartesian3;
  }>();

  const [startTime, setStartTime] = useState<JulianDate>();
  const [stopTime, setStopTime] = useState<JulianDate>();
  // const [bootTime, setBootTime] = useState<JulianDate>();

  let entityRef = useRef<any>();
  let viewer: CesiumViewer | undefined | null;

  useEffect(() => {
    Math.setRandomNumberSeed(3);
    setStartTime(JulianDate.fromIso8601("2019-05-13T16:38:49.599987+00:00"));
    // setBootTime(JulianDate.fromIso8601("2019-05-13T16:23:10.778107+00:00"));
    setStopTime(JulianDate.fromIso8601("2019-05-13T16:46:41.002275+00:00"));
    setTakeOff({
      alt: 20.952,
      position: Cartesian3.fromDegrees(151.210757, -33.861338, 300),
    });
  }, []);

  useEffect(() => {
    if (viewer && startTime && stopTime && takeOff) {
      viewer.animation.viewModel.setShuttleRingTicks([
        0.01,
        0.02,
        0.05,
        0.1,
        0.25,
        0.5,
        1,
        2,
        5,
        10,
        15,
        30,
        60,
        100,
        300,
        600,
        1000,
      ]);

      viewer.timeline.zoomTo(startTime, stopTime);

      const takeOffPositionInCartographic = Cartographic.fromCartesian(
        takeOff.position
      );
      sampleTerrainMostDetailed(viewer.terrainProvider, [
        takeOffPositionInCartographic,
      ]).then((updatedPositions) => {
        const groundOffset = takeOffPositionInCartographic.height - takeOff.alt;
        const newPosition = computePositionProperty(groundOffset + 2);
        // @ts-ignore
        entityRef.position = newPosition;
      });
    }
    // eslint-disable-next-line
  }, [startTime, stopTime, takeOff]);

  const computePositionProperty = (alt_offset: number): any => {
    const property = new SampledPositionProperty();

    position_data.forEach((cur_pos: any) => {
      const time = JulianDate.fromIso8601(cur_pos[0]);
      const position = Cartesian3.fromDegrees(
        cur_pos[1],
        cur_pos[2],
        cur_pos[3] + alt_offset
      );
      property.addSample(time, position);
    });

    return property;
  };

  const computeOrientationProperty = () => {
    if (!takeOff) {
      return null;
    }
    const orientationProperty = new TimeIntervalCollectionProperty();
    const origin = Cartesian3.fromRadians(
      takeOff.position.x,
      takeOff.position.y
    );

    const transform_matrix = Transforms.eastNorthUpToFixedFrame(origin);
    let rotation_matrix = new Matrix3();

    Matrix4.getMatrix3(transform_matrix, rotation_matrix);

    const northFacing = Matrix3.fromRotationZ(Math.toRadians(90.0));

    rotation_matrix = Matrix3.multiply(
      rotation_matrix,
      northFacing,
      new Matrix3()
    );

    const quaternion_enu_to_ecef = Quaternion.fromRotationMatrix(
      rotation_matrix
    );

    attitude_data.forEach((cur_attitude: any, index: number) => {
      const time = JulianDate.fromIso8601(cur_attitude[0]);
      const q = new Quaternion(
        cur_attitude[1],
        -cur_attitude[2],
        -cur_attitude[3],
        cur_attitude[4]
      );
      const orientation = new Quaternion();
      Quaternion.multiply(quaternion_enu_to_ecef, q, orientation);

      if (index < attitude_data.length - 1) {
        const next_attitude = attitude_data[index + 1];
        if (next_attitude) {
          const time_att_next = JulianDate.fromIso8601(next_attitude[0] as any);
          const timeInterval = new TimeInterval({
            start: time,
            stop: time_att_next,
            isStartIncluded: true,
            isStopIncluded: false,
            data: orientation,
          });
          orientationProperty.intervals.addInterval(timeInterval);
        }
      }
    });

    return orientationProperty;
  };

  const computeFlightModesProperty = () => {
    const flightModesProperty = new TimeIntervalCollectionProperty();

    flight_modes.forEach((cur_flight_mode: any, index: number) => {
      const cur_time = JulianDate.fromIso8601(cur_flight_mode[0]);
      const next_flight_mode = flight_modes[index + 1];
      if (next_flight_mode) {
        const next_time = JulianDate.fromIso8601(next_flight_mode[0]);

        const timeInterval = new TimeInterval({
          start: cur_time,
          stop: next_time,
          isStartIncluded: true,
          isStopIncluded: false,
          data: cur_flight_mode[1],
        });
        flightModesProperty.intervals.addInterval(timeInterval);
      }
    });

    return flightModesProperty;
  };

  const computeManualControlSetpointsProperty = () => {
    const manualControlSetpointsProperty = new TimeIntervalCollectionProperty();

    manual_control_setpoints.forEach((cur_sp: any, index: number) => {
      const cur_time = JulianDate.fromIso8601(cur_sp[0]);
      const next_sp = flight_modes[index + 1];
      if (next_sp) {
        const next_time = JulianDate.fromIso8601(next_sp[0]);

        const manual_control_setpoint = Cartesian4.fromElements(
          cur_sp[1],
          cur_sp[2],
          cur_sp[3],
          cur_sp[4]
        );

        var timeInterval = new TimeInterval({
          start: cur_time,
          stop: next_time,
          isStartIncluded: true,
          isStopIncluded: false,
          data: manual_control_setpoint,
        });

        manualControlSetpointsProperty.intervals.addInterval(timeInterval);
      }
    });

    return manualControlSetpointsProperty;
  };

  const positionProperty = computePositionProperty(0);
  const orientationProperty = computeOrientationProperty();
  const flightModesProperty = computeFlightModesProperty();
  const manualControlSetpointsProperty = computeManualControlSetpointsProperty();

  if (
    !(
      startTime &&
      stopTime &&
      positionProperty &&
      orientationProperty &&
      flightModesProperty &&
      manualControlSetpointsProperty
    )
  ) {
    console.log("display none");
    return null;
  }

  return (
    <div>
      <Viewer
        full
        terrainProvider={terrainProvider}
        infoBox={false}
        selectionIndicator={false}
        shouldAnimate={true}
        ref={(evt) => {
          viewer = evt && evt.cesiumElement;
        }}
        navigationInstructionsInitiallyVisible={false}
      >
        <Clock
          startTime={startTime?.clone()}
          stopTime={stopTime.clone()}
          currentTime={startTime.clone()}
          clockRange={ClockRange.LOOP_STOP}
          multiplier={1}
          shouldAnimate={false}
          onTick={(e) => {
            console.log("tick", e);
          }}
        />

        <Globe enableLighting={true} depthTestAgainstTerrain={true} />

        <SkyAtmosphere brightnessShift={0.2} />

        <Entity
          ref={(e) => {
            // @ts-ignore
            entityRef = e && e.cesiumElement;
          }}
          availability={
            new TimeIntervalCollection([
              new TimeInterval({ start: startTime, stop: stopTime }),
            ])
          }
          position={positionProperty}
          orientation={orientationProperty}
        >
          <ModelGraphics
            uri={AirModelOption.uri}
            minimumPixelSize={AirModelOption.minimumPixelSize}
            scale={AirModelOption.scale}
          />

          <PathGraphics
            resolution={1}
            material={Color.YELLOW}
            width={10}
            show={true}
          />
        </Entity>
      </Viewer>
    </div>
  );
};

export default LogPx4;
