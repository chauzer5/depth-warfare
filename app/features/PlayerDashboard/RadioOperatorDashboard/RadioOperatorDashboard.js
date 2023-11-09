/** @jsxImportSource @emotion/react */
import SectorsKey from "@/app/components/SectorsKey/SectorsKey";
import RadioMap from "./RadioMap";
import TriangleShiftButton from "./TriangleShiftButton";
import SystemChargeMeter from "@/app/components/SystemChargeMeter/SystemChargeMeter";
import { useGameContext } from "@/app/state/game_state";
import { capitalizeFirstLetter } from "@/app/utils";
import theme from "@/app/styles/theme";
import { useEffect, useRef, useState } from "react";
import { useAblyContext } from "@/app/state/ably_state";

export default function RadioOperatorDashboard() {
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
    rightColumn: {
      marginLeft: "50px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      height: "100vh",
    },
    header: {
      margin: 0,
      color: "white",
      fontSize: "26px",
    },
    leftColumn: {
      display: "flex",
      flexDirection: "column",
      justifyContent: "flex-start",
      alignItems: "center",
      marginRight: "20px",
    },
    shiftControls: {
      width: "300px",
      height: "120px",
    },
    shiftRow: {
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
      color: theme.white,
    },
    clearButton: {
      fontFamily: "VT323, monospace",
      fontSize: "20px",
      color: "white",
      backgroundColor: "black",
      border: "none",
      textDecoration: "none",
      marginLeft: "15px",
      cursor: "pointer",
    },
    bigButton: {
      width: "150px",
      height: "150px",
      marginTop: "40px",
      borderRadius: "50%",
      fontSize: "30px",
      backgroundColor: theme.green,
      color: "black",
      fontFamily: "VT323, monospace",
      margin: "10px",
    },
    movementsList: {
      backgroundColor: theme.black,
      border: "2px solid white",
      marginTop: "5px",
      height: "420px",
      padding: "10px",
      overflowY: "auto",
    },
  };

  const { 
    networkState, 
    playerTeam,
    getFirstMateSystem,
    getCellsDistanceAway,
  } = useGameContext();

  const { 
    movements, 
    systemHealthLevels, 
    movementCountOnDisable,
    systemChargeLevels,
    probes,
   } = networkState;

  const { channel } = useAblyContext();
  const [probeDisabled, setProbeDisabled] = useState(false);
  const [probeRange, setProbeRange] = useState([]);

  useEffect(() => {
    setProbeDisabled(systemHealthLevels[playerTeam]["probe"] === 0);
  }, [systemHealthLevels[playerTeam]["probe"]]);

  const isSystemCharged = (systemName, systemChargeLevels) => {
    return (
      systemChargeLevels[playerTeam][systemName] ===
      getFirstMateSystem(systemName).maxCharge
    );
  };

  const launchProbe = () => {
    channel.publish("radio-operator-place-probe", clickedCell );
  }

  const [clickedCell, setClickedCell] = useState({});

  const handleClick = (row, column) => {
    const newClickedCell = {row, column};
    setClickedCell(newClickedCell);
    console.log(probes[playerTeam]);

    //Attempts to find a probe with given row and column
    const findProbeIndex = probes[playerTeam].findIndex(list => list[0] === row && list[1] === column);
    if (findProbeIndex === -1){
      setProbeRange([]);
    }
    else {
      const newProbeRangeCells = getCellsDistanceAway(
        row,
        column,
        probes[playerTeam][findProbeIndex][2],
        false,
        false,
      )
      setProbeRange(newProbeRangeCells);
    }
  };

  const oppositeTeam = playerTeam === "blue" ? "red" : "blue";

  return (
    <div style={styles.main}>
      <div style={styles.container}>
        <div style={styles.leftColumn}>
          <SectorsKey />
          {/* <div style={styles.shiftControls}>
            <div style={styles.shiftRow}>
              <span style={{ color: theme.white }}>North</span>
            </div>
            <div style={styles.shiftRow}>
              <TriangleShiftButton direction="north" />
            </div>
            <div style={styles.shiftRow}>
              <span style={{ ...styles.directionText, width: "50px" }}>
                West
              </span>
              <TriangleShiftButton direction="west" />
              <div style={{ height: "100%", width: "50px" }} />
              <TriangleShiftButton direction="east" />
              <span style={styles.directionText}>East</span>
            </div>
            <div style={styles.shiftRow}>
              <TriangleShiftButton direction="south" />
            </div>
            <div style={styles.shiftRow}>
              <span style={{ color: theme.white }}>South</span>
            </div>
          </div> */}
        </div>
        <div>
          <RadioMap handleClick={handleClick} clickedCell={clickedCell} probeRange={probeRange} />
          {/* <button
            style={styles.clearButton}
            onClick={() => channel.publish("radio-operator-clear-notes", {})}
          >
            Clear
          </button> */}
        </div>
        <div style={styles.rightColumn}>
          <button style={{
            ...styles.bigButton,
            backgroundColor: probeDisabled
            ? "gray"
            : systemChargeLevels[playerTeam]["probe"] > 0
            ? getFirstMateSystem("probe").color || "defaultColor"
            : "gray"
          }}
            onClick={() => launchProbe()}
            disabled={systemChargeLevels[playerTeam]["probe"] === 0}>
            PROBE 
          </button>
          <SystemChargeMeter systemName="probe" />
        </div>
      </div>
    </div>
  );
}
