import { useGameContext } from "@/app/state/game_state";
import dayjs from "dayjs";
import { useState } from "react";
import { ROLE_MAP } from "@/app/utils";
import { useAblyContext } from "@/app/state/ably_state";
import theme from "@/app/styles/theme";
import SystemDamage from "./EngineerDashboard/SystemDamage";

export default function DashboardHeader() {
  const { playerRole, playerTeam, hostClientId, roomCode } = useGameContext();
  const { selfClientId } = useAblyContext();

  const styles = {
    main: {
      width: "100%",
      display: "flex",
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      // backgroundColor: "gray",
    },
    team: {
      color: playerTeam,
    },
    role: {
      margin: "0px",
      color: "white",
    },
    clock: {
      margin: "0px",
      color: "white",
    },
    roomCode: {
      margin: "0px",
      color: "white",
    },
    leftContainer: {
      display: "flex",
      margin: "10px",
      flexDirection: "column",
      // backgroundColor: "red",
      alignItems: "flex-start",
    },
    rightContainer: {
      display: "flex",
      margin: "10px",
      flexDirection: "column",
      // backgroundColor: "purple",
      alignItems: "flex-end",
    },
    lifeSupport: {
      margin: "0px",
      marginTop: "5px",
      color: "gray",
    },
    dividersContainer: {
      width: "365px",
      height: "15px",
      position: "absolute",
      display: "flex",
      flexDirection: "row",
      justifyContent: "space-evenly",
    }
  };

  const [clock, setClock] = useState(dayjs().format("HH:mm:ss"));

  setInterval(() => {
    setClock(dayjs().format("HH:mm:ss"));
  }, 100);

  const timeZone = new Date()
    .toLocaleTimeString("en-us", { timeZoneName: "short" })
    .split(" ")[2];

  const { networkState } = useGameContext();
  const { systemHealthLevels } = networkState;

  return (
      <div style={styles.main}>
        <div style={styles.leftContainer}>
          <h4 style={styles.role}>
            <span style={styles.team}>{`${
              playerTeam.charAt(0).toUpperCase() + playerTeam.slice(1)
            } Team`}</span>
            {` ${ROLE_MAP[playerRole]}`}
          </h4>
          <SystemDamage system={{name: "life support", color: theme.gray}} />
        </div>
        {selfClientId === hostClientId && <h4 style={styles.role}>Host</h4>}
        <div style={styles.rightContainer}>
          <h4 style={styles.clock}>{`${clock} ${timeZone}`}</h4>
          <h4 style={styles.roomCode}>Room Code: {roomCode}</h4>
        </div>
      </div>
  );
}
