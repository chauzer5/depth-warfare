import theme from "@/app/styles/theme";
import RoleButton from "./RoleButton";
import { useChannel, usePresence } from "@ably-labs/react-hooks";
import { useGameContext } from "@/app/state/game_state";
import { useEffect, useState } from "react";
import { useAblyContext } from "@/app/state/ably_state";

export default function MatchLobby() {
  const styles = {
    main: {
      width: "100%",
      height: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    },
    container: {
      display: "flex",
      flexDirection: "row",
      // flexWrap: "wrap",
    },
    column: {
      display: "flex",
      flexDirection: "column",
      width: "250px",
      margin: "10px",
    },
    lastColumn: {
      display: "flex",
      flexDirection: "column",
      margin: "10px",
      alignItems: "center",
      width: "200px",
      justifyContent: "space-between"
    },
    unassignedHeader: {
      color: theme.white,
      marginTop: 0,
      fontSize: "30px",
      textDecoration: "underline",
    },
    unassignedPlayer: {
      margin: "5px",
      color: theme.white,
    },
    roomCodeContainer: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
    },
    leaveRoomButton:{
      height: "40px",
      width: "100px",
      color: theme.gray,
      backgroundColor: theme.black,
      fontFamily: "'VT323', monospace",
      fontSize: "18px",
      border: `2px solid ${theme.gray}`,
    },
    beginMatchButton: {
      height: "50px",
      width: "180px",
      color: theme.white,
      backgroundColor: theme.black,
      fontFamily: "'VT323', monospace",
      fontSize: "24px",
      border: `2px solid ${theme.white}`
    },
    disabledButton: {
      height: "50px",
      width: "180px",
      color: theme.gray,
      backgroundColor: theme.black,
      fontFamily: "'VT323', monospace",
      fontSize: "24px",
      border: `2px solid ${theme.gray}`
    },
    roomCodeHeader: {
      margin: 0,
      color: theme.white,
    },
    roomCode: {
      margin: "10px",
      fontSize: "80px",
    },
  };

  const { username, roomCode, setNetworkState } = useGameContext();
  const { selfClientId } = useAblyContext();
  const [roomPlayers, setRoomPlayers] = useState([]);

  const [presenceData, updateStatus] = usePresence("depth-warfare-match-lobby", { name: username, roomCode: roomCode });

  useEffect(() => {
    setRoomPlayers(presenceData.filter((player) => player.data.roomCode === roomCode));
  }, [presenceData]);

  const handleLeaveRoom = () => {
    setNetworkState({ type: "currentStage", value: "main-menu" });
  };
  
  const handleRoleClick = (selectedTeam, selectedRole) => {
    const playerSelected = roomPlayers.find((player) => {
      return player.data.team === selectedTeam && player.data.role === selectedRole;
    });

    if(!playerSelected){
      updateStatus({ name: username, roomCode: roomCode, team: selectedTeam, role: selectedRole });
    }
    else if(playerSelected.clientId === selfClientId){
      updateStatus({ name: username, roomCode: roomCode, team: null, role: null });
    }
  };

  return (
    <div style={styles.main}>
      <div style={styles.container}>
        <div style={{...styles.column, width: "200px"}}>
          <h2 style={styles.unassignedHeader}>Unassigned:</h2>
          {roomPlayers
          .filter(player => !player.data.role)
          .map((player, index) => (
            <p key={index} style={styles.unassignedPlayer}>
              {player.data.name}
            </p>
          ))}
        </div>
        <div style={styles.column}>
          <RoleButton
            team="blue"
            role="captain"
            roomPlayers={roomPlayers}
            handleClick={handleRoleClick}
          />
          <RoleButton
            team="blue"
            role="first-mate"
            roomPlayers={roomPlayers}
            handleClick={handleRoleClick}
          />
          <RoleButton
            team="blue"
            role="engineer"
            roomPlayers={roomPlayers}
            handleClick={handleRoleClick}
          />
          <RoleButton
            team="blue"
            role="radio-operator"
            roomPlayers={roomPlayers}
            handleClick={handleRoleClick}
          />
        </div>
        <div style={styles.column}>
        <RoleButton
            team="red"
            role="captain"
            roomPlayers={roomPlayers}
            handleClick={handleRoleClick}
          />
          <RoleButton
            team="red"
            role="first-mate"
            roomPlayers={roomPlayers}
            handleClick={handleRoleClick}
          />
          <RoleButton
            team="red"
            role="engineer"
            roomPlayers={roomPlayers}
            handleClick={handleRoleClick}
          />
          <RoleButton
            team="red"
            role="radio-operator"
            roomPlayers={roomPlayers}
            handleClick={handleRoleClick}
          />
        </div>
        <div style={styles.lastColumn}>
          <div style={styles.roomCodeContainer}>
            <h2 style={styles.roomCodeHeader}>ROOM CODE:</h2>
            <h1 style={styles.roomCode}>{roomCode}</h1>
            <button style={styles.leaveRoomButton} onClick={handleLeaveRoom}>Leave Room</button>
          </div>
          <button
            style={roomPlayers.length < process.env.NUM_REQUIRED_PLAYERS ||
              roomPlayers.filter(player => !player.data.role).length > 0 ? styles.disabledButton : styles.beginMatchButton}
            disabled={roomPlayers.length < process.env.NUM_REQUIRED_PLAYERS ||
            roomPlayers.filter(player => !player.data.role).length > 0}
          >
            Begin Match
          </button>
        </div>
      </div>
    </div>
  );
}