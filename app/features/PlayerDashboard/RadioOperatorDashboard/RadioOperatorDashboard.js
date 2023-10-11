import SectorsKey from "@/app/components/SectorsKey/SectorsKey";
import RadioMap from "./RadioMap";
import TriangleShiftButton from "./TriangleShiftButton";
import { useGameContext } from "@/app/state/game_state";
import { capitalizeFirstLetter } from "@/app/utils";
import { Box } from "@mui/material";
import theme from "@/app/styles/theme";
import { useEffect, useRef, useState } from "react";

export default function RadioOperatorDashboard(props) {
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
    movementsList: {
      backgroundColor: theme.black,
      border: "2px solid white",
      marginTop: "5px",
      height: "420px",
      padding: "10px",
      overflowY: "auto",
    },
  };

  const { movements, systemHealthLevels, movementCountOnDisable, playerTeam } =
    useGameContext();

  const { channel } = props;

  const ref = useRef(null);
  const scrollToBottom = () => {
    ref.current.scrollIntoView({ behavior: "smooth" });
  };

  const isMoveHidden = (index) => {
    return (
      systemHealthLevels[playerTeam]["comms"] <= 0 &&
      index >= movementCountOnDisable[playerTeam === "blue" ? "red" : "blue"]
    );
  };

  const oppositeTeam = playerTeam === "blue" ? "red" : "blue";

  useEffect(() => {
    scrollToBottom();
  }, [movements[oppositeTeam]]);

  return (
    <div style={styles.main}>
      <div style={styles.container}>
        <div style={styles.leftColumn}>
          <SectorsKey />
          <div style={styles.shiftControls}>
            <div style={styles.shiftRow}>
              <span style={{ color: theme.white }}>North</span>
            </div>
            <div style={styles.shiftRow}>
              <TriangleShiftButton direction="north" channel={channel} />
            </div>
            <div style={styles.shiftRow}>
              <span style={{ ...styles.directionText, width: "50px" }}>
                West
              </span>
              <TriangleShiftButton direction="west" channel={channel} />
              <div style={{ height: "100%", width: "50px" }} />
              <TriangleShiftButton direction="east" channel={channel} />
              <span style={styles.directionText}>East</span>
            </div>
            <div style={styles.shiftRow}>
              <TriangleShiftButton direction="south" channel={channel} />
            </div>
            <div style={styles.shiftRow}>
              <span style={{ color: theme.white }}>South</span>
            </div>
          </div>
        </div>
        <div>
          <RadioMap channel={channel} />
          <button
            style={styles.clearButton}
            onClick={() => channel.publish("radio-operator-clear-notes", {})}
          >
            Clear
          </button>
        </div>
        <div style={styles.rightColumn}>
          <h3 style={styles.header}>Enemy Movements</h3>
          <Box style={styles.movementsList}>
            {movements[playerTeam === "blue" ? "red" : "blue"].map(
              (movement, index) => (
                <div
                  key={index}
                  style={{
                    fontSize: "24px",
                    color:
                      movement === "silence" && !isMoveHidden(index)
                        ? theme.purple
                        : movement.includes("surface") && !isMoveHidden(index)
                        ? theme.green
                        : theme.white,
                    marginLeft: "5px",
                  }}
                >
                  {`${index + 1}. ${
                    isMoveHidden(index)
                      ? "???"
                      : capitalizeFirstLetter(movement)
                  }`}
                </div>
              )
            )}
            <div ref={ref} />
          </Box>
        </div>
      </div>
    </div>
  );
}
