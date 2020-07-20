import React, { useState, useEffect } from "react";

import {
  Viewer,
  Globe,
  SkyAtmosphere,
  Clock,
  Entity,
  ModelGraphics,
  PathGraphics,
} from "resium";

import {
  Viewer as CesiumViewer,
  createWorldTerrain,
  Math,
  JulianDate,
  ClockRange,
  TimeIntervalCollectionProperty,
  Cartesian3,
  Cartographic,
  Transforms,
  Matrix3,
  Matrix4,
  Quaternion,
  TimeInterval,
  SampledPositionProperty,
  Cartesian4,
  TimeIntervalCollection,
  Color,
  HeadingPitchRange,
} from "cesium";

import flight_modes from "./constant/flight_modes";
import manual_control_setpoints from "./constant/manual_control_setpoints";
import position_data from "./constant/Position";
import attitude_data from "./constant/attitude_data";

import Drone from "./assets/models/drone.glb";

const terrainProvider = createWorldTerrain({
  requestVertexNormals: true,
  requestWaterMask: true,
});

const model_scale_factor = 1;

const shutterRingTicks = [
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
];

const pad = (num: number, size: number) => {
  let s = num + "";
  while (s.length < size) {
    s = "0" + s;
  }
  return s;
};

const format_timestamp = (boot_time_sec: number, show_ms: boolean) => {
  let ms = window.Math.round(boot_time_sec * 1000);
  let sec = window.Math.floor(ms / 1000);
  let minutes = window.Math.floor(sec / 60);
  const hours = window.Math.floor(minutes / 60);
  let ret_val;
  ms = ms % 1000;
  sec = sec % 60;
  minutes = minutes % 60;
  if (hours > 0) {
    ret_val = hours + ":" + pad(minutes, 2) + ":" + pad(sec, 2);
  } else {
    ret_val = minutes + ":" + pad(sec, 2);
  }
  if (show_ms) {
    ret_val = ret_val + "." + pad(ms, 3);
  }
  return ret_val;
};

interface TakeOff {
  altitude: number;
  position: {
    longitude: number;
    latitude: number;
    height: number;
  };
}

const default_model_scale = 20;

const LogPx4 = () => {
  const [takeOff, setTakeOff] = useState<TakeOff>();

  const [viewerElement, setViewerElement] = useState<CesiumViewer>();
  const [startTime, setStartTime] = useState<JulianDate>();
  const [stopTime, setStopTime] = useState<JulianDate>();
  const [bootTime, setBootTime] = useState<JulianDate>();

  const [positionProperty, setPositionProperty] = useState<
    SampledPositionProperty
  >();
  const [orientationProperty, setOrientationProperty] = useState<
    TimeIntervalCollectionProperty
  >();
  const [flightModesProperty, setFlightModesProperty] = useState<
    TimeIntervalCollectionProperty
  >();
  const [
    manualControlSetpointsProperty,
    setManualControlSetpointsProperty,
  ] = useState<TimeIntervalCollectionProperty>();

  useEffect(() => {
    Math.setRandomNumberSeed(3);
    setStartTime(JulianDate.fromIso8601("2019-05-13T16:38:49.599987+00:00"));
    setStopTime(JulianDate.fromIso8601("2019-05-13T16:46:41.002275+00:00"));
    setBootTime(JulianDate.fromIso8601("2019-05-13T16:23:10.778107+00:00"));

    setTakeOff({
      altitude: 20.952,
      position: Cartographic.fromDegrees(-117.0763111, 32.387429),
    });
  }, []);

  useEffect(() => {
    if (viewerElement) {
      viewerElement.animation.viewModel.setShuttleRingTicks(shutterRingTicks);

      document.addEventListener(
        "keyup",
        (e) => {
          if (e.keyCode === 32) {
            viewerElement.clock.shouldAnimate = !viewerElement.clock
              .shouldAnimate;
          } else if (e.keyCode === 37) {
            viewerElement.clock.multiplier =
              viewerElement.clock.multiplier > 0
                ? -viewerElement.clock.multiplier
                : viewerElement.clock.multiplier;
            viewerElement.clock.shouldAnimate = true;
          } else if (e.keyCode === 38) {
            viewerElement.clock.multiplier *= 1.5;
          } else if (e.keyCode === 39) {
            viewerElement.clock.multiplier =
              viewerElement.clock.multiplier < 0
                ? -viewerElement.clock.multiplier
                : viewerElement.clock.multiplier;
            viewerElement.clock.shouldAnimate = true;
          } else if (e.keyCode === 40) {
            viewerElement.clock.multiplier /= 1.5;
          }
        },
        false
      );

      viewerElement.zoomTo(
        viewerElement.entities,
        new HeadingPitchRange(0, Math.toRadians(-90), 120)
      );
    }

    return () => {
      document.removeEventListener("keyup", () =>
        console.log("key up event removed Listener")
      );
      viewerElement?.destroy();
    };
  }, [viewerElement]);

  useEffect(() => {
    if (bootTime && viewerElement) {
      const animationViewModel = viewerElement.animation.viewModel;

      animationViewModel.dateFormatter = () => "";

      animationViewModel.timeFormatter = (date, viewModel) => {
        const boot_time = JulianDate.secondsDifference(date, bootTime);
        return format_timestamp(boot_time, true);
      };
    }
  }, [viewerElement, bootTime]);

  useEffect(() => {
    if (startTime && stopTime && viewerElement) {
      viewerElement.timeline.zoomTo(startTime, stopTime);
    }
    // eslint-disable-next-line
  }, [startTime, stopTime]);

  useEffect(() => {
    if (takeOff) {
      const computeOrientationProperty = () => {
        const orientationProperty = new TimeIntervalCollectionProperty();
        let rotation_matrix = new Matrix3();

        const origin = Cartesian3.fromRadians(
          takeOff.position.longitude,
          takeOff.position.latitude
        );

        const transform_matrix = Transforms.eastNorthUpToFixedFrame(origin);

        Matrix4.getMatrix3(transform_matrix, rotation_matrix);

        const northFacing = Matrix3.fromRotationZ(Math.toRadians(90.0));
        rotation_matrix = Matrix3.multiply(
          rotation_matrix,
          northFacing,
          new Matrix3()
        );

        const q_enu_to_ecef = Quaternion.fromRotationMatrix(rotation_matrix);

        for (let i = 0; i < attitude_data.length; ++i) {
          const cur_attitude = attitude_data[i];

          const time_att = JulianDate.fromIso8601(cur_attitude[0] as string);

          const q = new Quaternion(
            cur_attitude[1] as number,
            -cur_attitude[2],
            -cur_attitude[3],
            cur_attitude[4] as number
          );
          const orientation = new Quaternion();
          Quaternion.multiply(q_enu_to_ecef, q, orientation);

          if (i < attitude_data.length - 1) {
            const next_attitude = attitude_data[i + 1];
            const time_att_next = JulianDate.fromIso8601(
              next_attitude[0] as string
            );
            const timeInterval = new TimeInterval({
              start: time_att,
              stop: time_att_next,
              isStartIncluded: true,
              isStopIncluded: false,
              data: orientation,
            });
            orientationProperty.intervals.addInterval(timeInterval);
          }
        }

        return orientationProperty;
      };

      const computePositionProperty = (altitude_offset: number) => {
        const property = new SampledPositionProperty();
        let position;

        for (let i = 0; i < position_data.length; ++i) {
          const cur_pos = position_data[i];
          const time = JulianDate.fromIso8601(cur_pos[0] as string);
          position = Cartesian3.fromDegrees(
            cur_pos[1] as number,
            cur_pos[2] as number,
            (cur_pos[3] as number) + altitude_offset
          );

          property.addSample(time, position);
        }
        return property;
      };

      const createTimeIntervalCollectionProperty = (data: any) => {
        const timeIntervalCollectionProperty = new TimeIntervalCollectionProperty();

        for (let i = 0; i < data.length - 1; ++i) {
          const cur_sp = data[i];
          const next_sp = data[i + 1];
          const cur_time = JulianDate.fromIso8601(cur_sp[0] as string);
          const next_time = JulianDate.fromIso8601(next_sp[0] as string);
          const manual_control_setPoint = Cartesian4.fromElements(
            cur_sp[1] as number,
            cur_sp[2] as number,
            cur_sp[3] as number,
            cur_sp[4] as number
          );

          const timeInterval = new TimeInterval({
            start: cur_time,
            stop: next_time,
            isStartIncluded: true,
            isStopIncluded: false,
            data: manual_control_setPoint,
          });

          timeIntervalCollectionProperty.intervals.addInterval(timeInterval);
        }

        return timeIntervalCollectionProperty;
      };

      setOrientationProperty(computeOrientationProperty());
      setPositionProperty(computePositionProperty(0));
      setFlightModesProperty(
        createTimeIntervalCollectionProperty(flight_modes)
      );
      setManualControlSetpointsProperty(
        createTimeIntervalCollectionProperty(manual_control_setpoints)
      );
    }
  }, [takeOff]);

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
    return null;
  }

  return (
    <Viewer
      full
      terrainProvider={terrainProvider}
      infoBox={false}
      selectionIndicator={false}
      navigationInstructionsInitiallyVisible={false}
      ref={(evt) => setViewerElement(evt?.cesiumElement)}
    >
      <Globe enableLighting={false} depthTestAgainstTerrain={true} />
      <SkyAtmosphere brightnessShift={0.2} />

      <Clock
        startTime={startTime.clone()}
        stopTime={stopTime.clone()}
        currentTime={startTime.clone()}
        clockRange={ClockRange.LOOP_STOP}
        multiplier={1}
        shouldAnimate={false}
      />

      <Entity
        availability={
          new TimeIntervalCollection([
            new TimeInterval({ start: startTime, stop: stopTime }),
          ])
        }
        position={positionProperty}
        orientation={orientationProperty}
      >
        <ModelGraphics
          uri={Drone}
          minimumPixelSize={64}
          scale={default_model_scale * model_scale_factor}
        />
        <PathGraphics
          resolution={1}
          material={Color.YELLOW}
          width={10}
          show={true}
        />
      </Entity>
    </Viewer>
  );
};

export default LogPx4;
