import { useGameContext } from "@/app/state/game_state";
import SystemActivator from "./SystemActivator";
import SectorsKey from "@/app/components/SectorsKey/SectorsKey";
import GameMap from "@/app/components/GameMap/GameMap";
import theme from "@/app/styles/theme";
import { SYSTEMS_INFO, capitalizeFirstLetter } from "@/app/utils";
import { useState, useEffect } from "react";
import { useAblyContext } from "@/app/state/ably_state";

export default function FirstMateDashboard() {
  const styles = {
    main: {
      width: "100%",
      height: "100%",
      flexGrow: 1,
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
    },
    systemsRow: {
      display: "flex",
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
    },
    pendingText: {
      color: theme.white,
      margin: 0,
      textAlign: "center",
      fontSize: "24px",
      width: "150px",
    },
    bottomSection: {
      height: "600px",
      marginTop: "20px",
      display: "flex",
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "flex-start",
    },
    controlsContainer: {
      width: "200px",
      display: "flex",
      flexDirection: "column",
      justifyContent: "flex-start",
      alignItems: "center",
      padding: "20px",
    },
    systemButton: {
      width: "150px",
      height: "30px",
      margin: "10px",
      borderRadius: "5px",
      fontSize: "20px",
      fontWeight: "bold",
      color: "white",
      fontFamily: "VT323, monospace",
    },
    bigButton: {
      width: "150px",
      height: "150px",
      marginTop: "40px",
      borderRadius: "50%",
      fontSize: "30px",
      backgroundColor: "red",
      color: "black",
      fontFamily: "VT323, monospace",
    },
    scanTypeSelector: {
      backgroundColor: "black",
      border: "3px solid green",
      color: "white",
      fontFamily: "VT323, monospace",
      height: "25px",
      marginTop: "12px",
    },
  };

  const { channel } = useAblyContext();

  const {
    playerTeam,
    getFirstMateSystem,
    getCellsDistanceAway,
    networkState,
  } = useGameContext();

  const {
    pendingNavigate,
    pendingSystemCharge,
    systemChargeLevels,
    subLocations,
    minesList,
    systemHealthLevels,
  } = networkState;

  const [toggledSystem, setToggledSystem] = useState("torpedo");
  const [clickedCell, setClickedCell] = useState({});
  const [torpedoCells, setTorpedoCells] = useState([]);
  const [dropMineCells, setDropMineCells] = useState([]);
  const [weaponsDisabled, setWeaponsDisabled] = useState(false);

  useEffect(() => {
    const [startRow, startCol] = subLocations[playerTeam];
    const newTorpedoCells = getCellsDistanceAway(
      startRow,
      startCol,
      process.env.TORPEDO_RANGE,
    );
    setTorpedoCells(newTorpedoCells);
    const newDropMineCells = getCellsDistanceAway(
      startRow,
      startCol,
      process.env.DROP_MINE_RANGE,
    );
    const filteredDropMineCells = newDropMineCells.filter((cell) => {
      if (
        minesList[playerTeam].some(
          ([row, col]) => row === cell[0] && col === cell[1],
        )
      ) {
        return false; // Don't include the cell in filteredDropMineCells
      }
      return true; // Include the cell in filteredDropMineCells
    });
    setDropMineCells(filteredDropMineCells);
  }, [subLocations[playerTeam], minesList[playerTeam]]);


  useEffect(() => {
    setWeaponsDisabled(systemHealthLevels[playerTeam]["weapons"] === 0);
  }, [systemHealthLevels[playerTeam]["weapons"]]);

  const handleMapSelector = (cell, row, column) => {
    if (cell.type != "island") {
      const newClickedCell = { row, column };
      setClickedCell(newClickedCell);
    }
  };

  const launchSystem = (systemName) => {
    if (systemName === "torpedo") {
      channel.publish("first-mate-fire-torpedo", clickedCell);
    }

    if (systemName === "mine" && validDropMine) {
      channel.publish("first-mate-drop-mine", clickedCell);
    }

    if (systemName === "mine" && validDetonateMine) {
      channel.publish("first-mate-detonate-mine", clickedCell);
    }
  };

  const isSystemCharged = (systemName, systemChargeLevels) => {
    return (
      systemChargeLevels[playerTeam][systemName] ===
      getFirstMateSystem(systemName).maxCharge
    );
  };

  const isSystemDisabled = (systemName) => {
    if (
      (systemName === "mine" || systemName === "torpedo") &&
      weaponsDisabled
    ) {
      return true;
    }
    return false;
  };

  const validTorpedoSelection =
    clickedCell &&
    torpedoCells.find(
      (cell) => cell[0] === clickedCell.row && cell[1] === clickedCell.column,
    );
 
  const validDropMine =
    clickedCell &&
    dropMineCells.find(
      (cell) => cell[0] === clickedCell.row && cell[1] === clickedCell.column,
    );
  const validDetonateMine =
    clickedCell &&
    minesList[playerTeam].find(
      (cell) => cell[0] === clickedCell.row && cell[1] === clickedCell.column,
    );

  return (
    <div style={styles.main}>
      <div style={styles.systemsRow}>
        {SYSTEMS_INFO.map((system, index) => {
          return <SystemActivator key={index} system={system} />;
        })}
        {pendingNavigate[playerTeam] && !pendingSystemCharge[playerTeam] && (
          <div>
            <h6 style={styles.pendingText}>{`MOVING: ${pendingNavigate[
              playerTeam
            ].toUpperCase()}`}</h6>
            <h6 style={styles.pendingText}>Choose a system to charge</h6>
          </div>
        )}
        {pendingNavigate[playerTeam] && pendingSystemCharge[playerTeam] && (
          <div>
            <h6 style={styles.pendingText}>{`MOVING: ${pendingNavigate[
              playerTeam
            ].toUpperCase()}`}</h6>
            <h6 style={styles.pendingText}>Waiting for engineer...</h6>
          </div>
        )}
      </div>
      <div style={styles.bottomSection}>
        <SectorsKey />
        <GameMap
          toggledSystem={toggledSystem}
          clickedCell={clickedCell}
          handleClick={handleMapSelector}
          torpedoCells={torpedoCells}
          dropMineCells={dropMineCells}
        />
        <div style={styles.controlsContainer}>
          <button
            style={{
              ...styles.systemButton,
              backgroundColor:
                toggledSystem === "torpedo"
                  ? getFirstMateSystem("torpedo").color
                  : "black",
              border:
                toggledSystem === "torpedo"
                  ? theme.white
                  : `3px solid ${getFirstMateSystem("torpedo").color}`,
            }}
            onClick={() => setToggledSystem("torpedo")}
          >
            Torpedo
          </button>

          <button
            style={{
              ...styles.systemButton,
              backgroundColor:
                toggledSystem === "mine"
                  ? getFirstMateSystem("mine").color
                  : "black",
              border:
                toggledSystem === "mine"
                  ? theme.white
                  : `3px solid ${getFirstMateSystem("mine").color}`,
            }}
            onClick={() => setToggledSystem("mine")}
          >
            Mine
          </button>

          <button
            style={{
              ...styles.bigButton,
              backgroundColor: isSystemDisabled(toggledSystem)
                ? "gray"
                : isSystemCharged("torpedo", systemChargeLevels) &&
                  validTorpedoSelection &&
                  toggledSystem === "torpedo"
                ? "red"
                : isSystemCharged("mine", systemChargeLevels) &&
                  validDropMine &&
                  toggledSystem === "mine"
                ? getFirstMateSystem("mine").color
                : validDetonateMine && toggledSystem === "mine"
                ? getFirstMateSystem("mine").color
                : "gray",
            }}
            disabled={
              (toggledSystem === "mine" &&
                !validDetonateMine &&
                !isSystemCharged("mine", systemChargeLevels)) ||
              (toggledSystem === "mine" &&
                !validDetonateMine &&
                !validDropMine) ||
              (!isSystemCharged("torpedo", systemChargeLevels) &&
                toggledSystem === "torpedo") ||
              (toggledSystem === "torpedo" && !validTorpedoSelection) ||
              isSystemDisabled(toggledSystem)
            }
            onClick={() => launchSystem(toggledSystem)}
          >
            {isSystemDisabled(toggledSystem)
              ? "Disabled"
              : toggledSystem === "torpedo" &&
                validTorpedoSelection &&
                isSystemCharged("torpedo", systemChargeLevels)
              ? "Launch Torpedo"
              : toggledSystem === "torpedo" &&
                isSystemCharged("torpedo", systemChargeLevels) &&
                !validTorpedoSelection
              ? "Invalid Selection"
              : toggledSystem === "mine" && validDetonateMine // Detonate happens before drop
              ? "Detonate Mine"
              : toggledSystem === "mine" && !validDetonateMine && !validDropMine
              ? "Invalid Selection"
              : toggledSystem === "mine" &&
                validDropMine &&
                isSystemCharged("mine", systemChargeLevels)
              ? "Drop Mine"
              : `Charge ${capitalizeFirstLetter(toggledSystem)}`}
          </button>
        </div>
      </div>
    </div>
  );
}
