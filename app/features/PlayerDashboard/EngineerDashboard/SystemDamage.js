import { useGameContext } from "@/app/state/game_state";
import theme from "@/app/styles/theme";
import { capitalizeFirstLetter } from "@/app/utils";
import { useEffect, useState } from "react";

export default function SystemDamage(props) {
  const { system } = props;

  const styles = {
    container: {
      display: "flex",
      alignItems: "center",
      justifyContent: "flex-start",
      width: "500px",
      margin: "5px",
      marginBottom: "10px",
    },
    buttonText: {
      color: system.color,
      fontSize: "24px",
    },
    "@keyframes blink": {
      "0%": { opacity: 1 },
      "49.99%": { opacity: 1 },
      "50%": { opacity: 0 },
      "99.99%": { opacity: 0 },
      "100%": { opacity: 1 },
    },
    rectangle: {
      height: "15px",
      backgroundColor: system.color,
      borderRadius: "15px",
      marginRight: "10px",
      transition: "width 1s ease",
    },
    damageRectangle: {
      animation: "blink 1s infinite",
      backgroundColor: theme.white,
      "@keyframes blink": {
        "0%": { opacity: 1 },
        "49.99%": { opacity: 1 },
        "50%": { opacity: 0 },
        "99.99%": { opacity: 0 },
        "100%": { opacity: 1 },
      },
    },
    rectangleBorder: {
      height: "15px",
      backgroundColor: theme.black,
      borderRadius: "18px",
      border: "4px solid ${system.color}",
      marginRight: "10px",
    },
    clickableRectangleBorder: {
      flex: 1,
      height: "15px",
      backgroundColor: theme.black,
      borderRadius: "18px",
      border: "4px solid ${system.color}",
      marginRight: "10px",
      transition: "width 1s ease",
      cursor: "pointer",
      boxShadow: "0px 0px 8px 8px rgba(255,255,255,0.5)",
    },
    textContainer: {
      width: "200px",
      overflow: "hidden",
      whiteSpace: "nowrap",
    },
    dividersContainer: {
      width: "365px",
      height: "15px",
      position: "absolute",
      display: "flex",
      flexDirection: "row",
      justifyContent: "space-evenly",
    },
  };

  const {
    playerTeam,
    calculateSystemNodeDistance,
    calculateMaxSystemHealth,
    networkState,
  } = useGameContext();

  const { systemHealthLevels, repairMatrix } = networkState;

  const [numChunks, setNumChunks] = useState(0);
  const [barWidth, setBarWidth] = useState(0);

  useEffect(() => {
    setNumChunks(calculateSystemNodeDistance(system.name));
  }, [system, repairMatrix]);

  useEffect(() => {
    if (system.name === "life support") {
      setBarWidth(
        Math.ceil(
          (systemHealthLevels[playerTeam][system.name] * 100) /
            process.env.STARTING_LIFE_SUPPORT,
        ),
      );
    } else {
      setBarWidth(
        Math.ceil(
          (systemHealthLevels[playerTeam][system.name] * 100) /
            calculateMaxSystemHealth(repairMatrix[playerTeam], system.name),
        ),
      );
    }
  }, [systemHealthLevels[playerTeam][system.name]]);

  return (
    <div style={styles.container}>
      <div style={{ ...styles.textContainer, width: "150px" }}>
        <span style={styles.buttonText}>
          {capitalizeFirstLetter(system.name)}
        </span>
      </div>
      <div style={styles.container}>
        <div
          style={{
            ...styles.rectangle,
            width: `${barWidth}%`,
          }}
        ></div>
        {system.name != "life support" && numChunks > 0 && (
          <div style={styles.dividersContainer}>
            {Array(numChunks - 1)
              .fill(0)
              .map((chunk, index) => {
                return (
                  <div
                    key={index}
                    style={{
                      width: "2px",
                      height: "15px",
                      backgroundColor:
                        index > systemHealthLevels[playerTeam][system.name] - 2
                          ? "#00000000"
                          : theme.black,
                    }}
                  ></div>
                );
              })}
          </div>
        )}

        {system.name === "life support" && (
          <div style={styles.dividersContainer}>
            {Array(process.env.STARTING_LIFE_SUPPORT - 1)
              .fill(0)
              .map((chunk, index) => {
                return (
                  <div
                    key={index}
                    style={{
                      width: "2px",
                      height: "15px",
                      backgroundColor:
                        index > systemHealthLevels[playerTeam][system.name] - 2
                          ? "#00000000"
                          : theme.black,
                    }}
                  ></div>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
}
