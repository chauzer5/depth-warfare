import SectorsKey from "@/app/components/SectorsKey/SectorsKey";
import TeamRoleDescription from "./TeamRoleDescription";
import Timer from "@/app/components/Timer/Timer";
import GameMap from "@/app/components/GameMap/GameMap";
import { useGameContext } from "@/app/state/game_state";
import { useEffect, useRef } from "react";
import { useAblyContext } from "@/app/state/ably_state";

export default function CaptainStartingSpot() {
  const styles = {
    main: {
      width: "100%",
      height: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    },
    container: {
      width: "800px",
      height: "700px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      whiteSpace: "pre-wrap",
    },
    header: {
      textAlign: "center",
      marginTop: "0px",
    },
    bottomSection: {
      flexGrow: 1,
      width: "100%",
      display: "flex",
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "flex-start",
    },
  };

  const { channel } = useAblyContext();
  const { playerTeam, networkState } = useGameContext();
  const { gameMap, subLocations } = networkState;

  const handleClick = (cell, row, column) => {
    if (cell.type === "water") {
      if (cell.subPresent[playerTeam] === true && playerTeam === "blue") {
        return;
      }
      if (cell.subPresent[playerTeam] === true && playerTeam === "red") {
        return;
      }

      channel.publish("captain-set-starting-spot", { row, column });
    }
  };

  const gameMapRef = useRef(gameMap);
  const subLocationsRef = useRef(subLocations);

  useEffect(() => {
    gameMapRef.current = gameMap;
  }, [gameMap]);

  useEffect(() => {
    subLocationsRef.current = subLocations;
  }, [subLocations]);

  const handleTimeOut = () => {
    // If the timer runs out, pick a random starting location
    let row;
    let column;
    let validSpot = false;
    do {
      row = Math.floor(Math.random() * process.env.MAP_DIMENSION);
      column = Math.floor(Math.random() * process.env.MAP_DIMENSION);
      if (gameMapRef.current[row][column].type === "water") {
        validSpot = true;
      }
    } while (!validSpot);

    if (!subLocationsRef.current[playerTeam]) {
      channel.publish("captain-set-starting-spot", { row, column });
    }
  };

  return (
    <div style={styles.main}>
      <div style={styles.container}>
        <TeamRoleDescription />
        <h3 style={styles.header}>
          {"Please choose a starting location\nfor your team's submarine:"}
        </h3>
        <div style={styles.bottomSection}>
          <Timer
            text="Time left"
            seconds={process.env.STARTING_SPOT_TIMER_SECONDS}
            onFinish={handleTimeOut}
          />
          <GameMap handleClick={handleClick} sonarDetectionRange={[]} />
          <SectorsKey />
        </div>
      </div>
    </div>
  );
}
