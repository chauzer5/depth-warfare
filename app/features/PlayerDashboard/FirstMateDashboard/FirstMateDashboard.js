import { useGameContext } from "@/app/state/game_state";
import SystemActivator from "./SystemActivator";
import SectorsKey from "@/app/components/SectorsKey/SectorsKey";
import GameMap from "@/app/components/GameMap/GameMap";
import theme from "@/app/styles/theme";
import { SYSTEMS_INFO, capitalizeFirstLetter } from "@/app/utils";
import { useState, useEffect } from "react";

export default function FirstMateDashboard(props) {
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

  const { channel } = props;

  const {
    pendingNavigate,
    playerTeam,
    pendingSystemCharge,
    getFirstMateSystem,
    systemChargeLevels,
    getCellsDistanceAway,
    subLocations,
    scanForEnemySub,
    minesList,
    systemHealthLevels,
  } = useGameContext();

  const [toggledSystem, setToggledSystem] = useState("torpedo");
  const [scanType, setScanType] = useState("sector"); // ['sector', 'row', 'column']
  const [clickedCell, setClickedCell] = useState({});
  const [torpedoCells, setTorpedoCells] = useState([]);
  const [dropMineCells, setDropMineCells] = useState([]);
  const [weaponsDisabled, setWeaponsDisabled] = useState(false);
  const [scanDisabled, setScanDisabled] = useState(false);

  useEffect(() => {
    const [startRow, startCol] = subLocations[playerTeam];
    const newTorpedoCells = getCellsDistanceAway(
      startRow,
      startCol,
      process.env.TORPEDO_RANGE
    );
    setTorpedoCells(newTorpedoCells);
    const newDropMineCells = getCellsDistanceAway(
      startRow,
      startCol,
      process.env.DROP_MINE_RANGE
    );
    const filteredDropMineCells = newDropMineCells.filter((cell) => {
      if (
        minesList[playerTeam].some(
          ([row, col]) => row === cell[0] && col === cell[1]
        )
      ) {
        return false; // Don't include the cell in filteredDropMineCells
      }
      return true; // Include the cell in filteredDropMineCells
    });
    setDropMineCells(filteredDropMineCells);
  }, [subLocations[playerTeam], minesList[playerTeam]]);

  useEffect(() => {
    setScanDisabled(systemHealthLevels[playerTeam]["scan"] === 0);
  }, [systemHealthLevels[playerTeam]["scan"]]);

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

    if (systemName === "scan") {
      const scanResult = scanForEnemySub(
        clickedCell.row,
        clickedCell.column,
        scanType
      );
      channel.publish("first-mate-scan", { scanResult });
    }

    if (systemName === "mine" && validDropMine) {
      channel.publish("first-mate-drop-mine", clickedCell);
    }

    if (systemName === "mine" && validDetonateMine) {
      channel.publish("first-mate-detonate-mine", clickedCell);
    }
  };

  const isSystemCharged = (systemName) => {
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
    if (systemName === "scan" && scanDisabled) {
      return true;
    }
    return false;
  };

  const validTorpedoSelection =
    clickedCell &&
    torpedoCells.find(
      (cell) => cell[0] === clickedCell.row && cell[1] === clickedCell.column
    );
  const validScanSelection = !!clickedCell;
  const validDropMine =
    clickedCell &&
    dropMineCells.find(
      (cell) => cell[0] === clickedCell.row && cell[1] === clickedCell.column
    );
  const validDetonateMine =
    clickedCell &&
    minesList[playerTeam].find(
      (cell) => cell[0] === clickedCell.row && cell[1] === clickedCell.column
    );

  return (
    <div style={styles.main}>
      <div style={styles.systemsRow}>
        {SYSTEMS_INFO.map((system, index) => {
          return (
            <SystemActivator key={index} system={system} channel={channel} />
          );
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

          <div
            style={{
              display: "flex",
              flexDirection: "row",
              marginLeft: "56px",
            }}
          >
            <button
              style={{
                ...styles.systemButton,
                backgroundColor:
                  toggledSystem === "scan"
                    ? getFirstMateSystem("scan").color
                    : "black",
                border:
                  toggledSystem === "scan"
                    ? theme.white
                    : `3px solid ${getFirstMateSystem("scan").color}`,
              }}
              onClick={() => setToggledSystem("scan")}
            >
              Scan
            </button>

            <select
              style={styles.scanTypeSelector}
              name="scanType"
              id="scanType"
              value={scanType}
              onChange={(e) => setScanType(e.target.value)}
            >
              <option value="sector">Sector</option>
              <option value="row">Row</option>
              <option value="column">Column</option>
            </select>
          </div>

          <button
            style={{
              ...styles.bigButton,
              backgroundColor: isSystemDisabled(toggledSystem)
                ? "gray"
                : isSystemCharged("torpedo") &&
                  validTorpedoSelection &&
                  toggledSystem === "torpedo"
                ? "red"
                : isSystemCharged("mine") &&
                  validDropMine &&
                  toggledSystem === "mine"
                ? getFirstMateSystem("mine").color
                : validDetonateMine && toggledSystem === "mine"
                ? getFirstMateSystem("mine").color
                : isSystemCharged("scan") &&
                  validScanSelection &&
                  toggledSystem === "scan"
                ? getFirstMateSystem("scan").color
                : "gray",
            }}
            disabled={
              (toggledSystem === "mine" &&
                !validDetonateMine &&
                !isSystemCharged("mine")) ||
              (toggledSystem === "mine" &&
                !validDetonateMine &&
                !validDropMine) ||
              (!isSystemCharged("torpedo") && toggledSystem === "torpedo") ||
              (toggledSystem === "torpedo" && !validTorpedoSelection) ||
              (!isSystemCharged("scan") && toggledSystem === "scan") ||
              (toggledSystem === "scan" && !validScanSelection) ||
              isSystemDisabled(toggledSystem)
            }
            onClick={() => launchSystem(toggledSystem)}
          >
            {isSystemDisabled(toggledSystem)
              ? "Disabled"
              : toggledSystem === "torpedo" &&
                validTorpedoSelection &&
                isSystemCharged("torpedo")
              ? "Launch Torpedo"
              : toggledSystem === "torpedo" &&
                isSystemCharged("torpedo") &&
                !validTorpedoSelection
              ? "Invalid Selection"
              : toggledSystem === "scan" &&
                isSystemCharged("scan") &&
                !validScanSelection
              ? "Invalid Selection"
              : toggledSystem === "scan" && isSystemCharged("scan")
              ? "Scan"
              : toggledSystem === "mine" && validDetonateMine // Detonate happens before drop
              ? "Detonate Mine"
              : toggledSystem === "mine" && !validDetonateMine && !validDropMine
              ? "Invalid Selection"
              : toggledSystem === "mine" &&
                validDropMine &&
                isSystemCharged("mine")
              ? "Drop Mine"
              : `Charge ${capitalizeFirstLetter(toggledSystem)}`}
          </button>
        </div>
      </div>
    </div>
  );
}
