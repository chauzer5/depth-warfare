import GameMap from "@/app/components/GameMap/GameMap";
import SectorsKey from "@/app/components/SectorsKey/SectorsKey";
import SystemChargeMeter from "@/app/components/SystemChargeMeter/SystemChargeMeter";
import MovementPendingCard from "./MovementPendingCard";
import theme from "@/app/styles/theme";
import { useGameContext } from "@/app/state/game_state";
import TriangleMoveButton from "./TriangleMoveButton";
import { SYSTEMS_INFO } from "@/app/utils";
import { useEffect, useState } from "react";
import { useAblyContext } from "@/app/state/ably_state";

export default function CaptainDashboard() {
  const styles = {
    main: {
      width: "100%",
      height: "100%",
      flexGrow: 1,
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    },
    container: {
      display: "flex",
      flexDirection: "row",
      justifyContent: "center",
    },
    controls: {
      width: "300px",
      height: "450px",
      marginLeft: "40px",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      alignItems: "center",
    },
    navButtons: {
      width: "100%",
      flexGrow: 1,
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
    },
    navRow: {
      width: "100%",
      height: "40px",
      display: "flex",
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      whiteSpace: "nowrap",
    },
    directionText: {
      margin: "10px",
    },
    boostControls: {
      width: "100%",
      height: "50px",
      marginBottom: "20px",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
    },
    surfaceButton: {
      backgroundColor: theme.black,
      border: "none",
      color: theme.white,
      textDecoration: "none",
      fontFamily: "'VT323', monospace",
      fontSize: "24px",
    },
    boostButton: {
      backgroundColor: theme.black,
      border: "none",
      textDecoration: "none",
      fontFamily: "'VT323', monospace",
      fontSize: "24px",
    },
  };

  const { playerTeam, networkState, isNavigationDisabled, getCellsDistanceAway} = useGameContext();

  const {
    pendingNavigate,
    systemChargeLevels,
    systemHealthLevels,
    gameMap,
    subLocations,
    randomEnabledDirection,
    probes
  } = networkState;

  const { channel } = useAblyContext();

  //check to see if engine is broken
  const directions = ["north", "south", "west", "east"];
  const disabledDirectionStates = {};

  directions.forEach((direction) => {
    disabledDirectionStates[direction] = isNavigationDisabled(
      direction,
      playerTeam,
      gameMap,
      subLocations,
    );
  });

  const [boostActivated, setBoostActivated] = useState(false);
  // const [anyProbeDetecting, setAnyProbeDetecting] = useState(false);
  const [probeDetectionRange, setProbeDetectionRange] = useState([]);

  const boostCharged =
    systemChargeLevels[playerTeam].boost ===
    SYSTEMS_INFO.find((system) => system.name === "boost").maxCharge;

  const boostStateStyle = {
    color:
      !boostCharged || pendingNavigate[playerTeam]
        ? theme.gray
        : boostActivated
        ? theme.purple
        : theme.white,
    cursor:
    boostCharged && !pendingNavigate[playerTeam] ? "pointer" : "default",
  };

  const handleClickBoost = () => {
    if (boostCharged && !pendingNavigate[playerTeam]) {
      setBoostActivated(!boostActivated);
    }
  };

  const handleClickSurface = () => {
    channel.publish("captain-surface", {});
  };

  useEffect(() => {
    // If we've just used boost, turn off the cell selector
    if (systemChargeLevels[playerTeam].boost === 0) {
      setBoostActivated(false);
    }
  }, [systemChargeLevels[playerTeam].boost]);

  const oppositeTeam = playerTeam === "blue" ? "red" : "blue";
  const brokenEngine = systemHealthLevels[playerTeam].engine === 0;

  // useEffect(() => {
  //   const newAnyProbeDetecting = gameMap.some(row =>
  //     row.some((cell, columnIndex) => {
  //       const rowIndex = gameMap.indexOf(row);
  //       const probe = probes[oppositeTeam].find(
  //         note => note[0] === rowIndex && note[1] === columnIndex
  //       );

  //       if (probe) {
  //         const getProbeRange = getCellsDistanceAway(
  //           rowIndex,
  //           columnIndex,
  //           probe[2],
  //           false,
  //           false
  //         );

  //         return getProbeRange.some(
  //           note =>
  //             note[0] === subLocations[playerTeam][0] &&
  //             note[1] === subLocations[playerTeam][1]
  //         );
  //       }

  //       return false;
  //     })
  //   );

  //   setAnyProbeDetecting(newAnyProbeDetecting);
  //   console.log(newAnyProbeDetecting);
  // }, [subLocations, probes]);

  useEffect(() => {
    const subRange = getCellsDistanceAway(
      subLocations[playerTeam][0],
      subLocations[playerTeam][1],
      process.env.PROBE_DETECTION_RANGE,   
      false,
      false,
    );
    setProbeDetectionRange(subRange);
  }, [subLocations]);

  return (
    <div style={styles.main}>
      <div style={styles.container}>
        {/* <div style={{display: "flex", flexDirection: "column", alignItems: "center"}}>
          <SectorsKey />
          <h6 style={{ color: theme.white, margin: "10px" }}>Enemy Detection</h6>
          <div style={{
            backgroundColor: anyProbeDetecting ? theme.red : theme.white,
            width: "30px",
            height: "30px",
            borderRadius: "15px",
            filter: anyProbeDetecting ?  "blur(5px)" : "blur(2px)",
          }} />
        </div> */}
        <GameMap boost={boostActivated} probeDetectionRange={probeDetectionRange} />
        <div style={styles.controls}>
          {brokenEngine ? (
            <h3 style={{ color: "red" }}>Engine is Broken</h3>
          ) : null}
          {pendingNavigate[playerTeam] && <MovementPendingCard />}
          <div style={styles.navButtons}>
            <div style={styles.navRow}>
              <span>North</span>
            </div>
            <div style={styles.navRow}>
              <TriangleMoveButton
                direction="north"
                brokenEngine={brokenEngine}
                disabled={
                  disabledDirectionStates["north"] ||
                  pendingNavigate[playerTeam] ||
                  boostActivated
                }
                enabledDirection={randomEnabledDirection[playerTeam]}
              />
            </div>
            <div style={styles.navRow}>
              <span style={styles.directionText}>West</span>
              <TriangleMoveButton
                direction="west"
                brokenEngine={brokenEngine}
                disabled={
                  disabledDirectionStates["west"] ||
                  pendingNavigate[playerTeam] ||
                  boostActivated
                }
                enabledDirection={randomEnabledDirection[playerTeam]}
              />
              <div style={{ height: "100%", width: "50px" }} />
              <TriangleMoveButton
                direction="east"
                brokenEngine={brokenEngine}
                disabled={
                  disabledDirectionStates["east"] ||
                  pendingNavigate[playerTeam] ||
                  boostActivated
                }
                enabledDirection={randomEnabledDirection[playerTeam]}
              />
              <span style={styles.directionText}>East</span>
            </div>
            <div style={styles.navRow}>
              <TriangleMoveButton
                direction="south"
                brokenEngine={brokenEngine}
                disabled={
                  disabledDirectionStates["south"] ||
                  pendingNavigate[playerTeam] ||
                  boostActivated
                }
                enabledDirection={randomEnabledDirection[playerTeam]}
              />
            </div>
            <div style={styles.navRow}>
              <span>South</span>
            </div>
          </div>
          <div style={styles.boostControls}>
            <button
              style={{ ...styles.boostButton, ...boostStateStyle }}
              onClick={handleClickBoost}
            >
              {!boostCharged
                ? "Charge Boost"
                : pendingNavigate[playerTeam]
                ? "Pending Navigate"
                : boostActivated
                ? "Cancel"
                : "Activate Boost"}
            </button>
            <SystemChargeMeter systemName="boost" />
          </div>
          <button style={styles.surfaceButton} onClick={handleClickSurface}>
            Surface
          </button>
        </div>
      </div>
    </div>
  );
}
