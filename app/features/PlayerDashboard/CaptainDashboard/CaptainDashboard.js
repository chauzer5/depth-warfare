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
    silenceControls: {
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
    silenceButton: {
      backgroundColor: theme.black,
      border: "none",
      textDecoration: "none",
      fontFamily: "'VT323', monospace",
      fontSize: "24px",
    },
  };

  const {
    playerTeam,
    networkState,
    isNavigationDisabled,
  } = useGameContext();

  const { pendingNavigate, systemChargeLevels, systemHealthLevels, gameMap, subLocations, randomEnabledDirection } = networkState

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

  const [silenceActivated, setSilenceActivated] = useState(false);

  const silenceCharged =
    systemChargeLevels[playerTeam].silence ===
    SYSTEMS_INFO.find((system) => system.name === "silence").maxCharge;

  const silenceStateStyle = {
    color:
      !silenceCharged || pendingNavigate[playerTeam]
        ? theme.gray
        : silenceActivated
        ? theme.purple
        : theme.white,
    cursor:
      silenceCharged && !pendingNavigate[playerTeam] ? "pointer" : "default",
  };

  const handleClickSilence = () => {
    if (silenceCharged && !pendingNavigate[playerTeam]) {
      setSilenceActivated(!silenceActivated);
    }
  };

  const handleClickSurface = () => {
    channel.publish("captain-surface", {});
  };

  useEffect(() => {
    // If we've just used silence, turn off the cell selector
    if (systemChargeLevels[playerTeam].silence === 0) {
      setSilenceActivated(false);
    }
  }, [systemChargeLevels[playerTeam].silence]);

  const brokenEngine = systemHealthLevels[playerTeam].engine === 0;

  return (
    <div style={styles.main}>
      <div style={styles.container}>
        <SectorsKey />
        <GameMap silence={silenceActivated} />
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
                  silenceActivated
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
                  silenceActivated
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
                  silenceActivated
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
                  silenceActivated
                }
                enabledDirection={randomEnabledDirection[playerTeam]}
              />
            </div>
            <div style={styles.navRow}>
              <span>South</span>
            </div>
          </div>
          <div style={styles.silenceControls}>
            <button
              style={{ ...styles.silenceButton, ...silenceStateStyle }}
              onClick={handleClickSilence}
            >
              {!silenceCharged
                ? "Charge Silence"
                : pendingNavigate[playerTeam]
                ? "Pending Navigate"
                : silenceActivated
                ? "Cancel"
                : "Activate Silence"}
            </button>
            <SystemChargeMeter systemName="silence" />
          </div>
          <button style={styles.surfaceButton} onClick={handleClickSurface}>
            Surface
          </button>
        </div>
      </div>
    </div>
  );
}
