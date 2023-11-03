import theme from "@/app/styles/theme";
import RoleButton from "./RoleButton";
import { useChannel, usePresence } from "@ably-labs/react-hooks";
import { useGameContext } from "@/app/state/game_state";
import { useEffect, useState } from "react";
import { useAblyContext } from "@/app/state/ably_state";
import { v4 as uuidv4 } from "uuid";

export default function MatchLobby(props) {
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
      justifyContent: "space-between",
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
    leaveRoomButton: {
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
      border: `2px solid ${theme.white}`,
    },
    disabledButton: {
      height: "50px",
      width: "180px",
      color: theme.gray,
      backgroundColor: theme.black,
      fontFamily: "'VT323', monospace",
      fontSize: "24px",
      border: `2px solid ${theme.gray}`,
    },
    roomCodeHeader: {
      margin: 0,
      color: theme.white,
    },
    roomCode: {
      margin: "10px",
      fontSize: "80px",
      userSelect: "text",
    },
  };

  const {
    username,
    roomCode,
    setNetworkState,
    setGameId,
    setPlayerRole,
    setPlayerTeam,
    playerRole,
  } = useGameContext();
  const { selfClientId, supabaseLobbyData } = useAblyContext();
  const [roomPlayers, setRoomPlayers] = useState([]);
  const { inProgressGame } = props;

  const [channel] = useChannel("depth-warfare-match-lobby", (message) => {
    if (message.name === "start-game" && message.data.roomCode === roomCode) {
      setGameId(message.data.gameId);
      setNetworkState({ type: "currentStage", value: "starting-spot" });
    }
  });

  const [presenceData, updateStatus] = usePresence(
    "depth-warfare-match-lobby",
    { name: username, roomCode: roomCode },
  );

  useEffect(() => {
    if (inProgressGame) {
      const existingPlayers = [];

      if (supabaseLobbyData.blue_captain) {
        existingPlayers.push({
          data: {
            name: supabaseLobbyData.blue_captain,
            team: "blue",
            role: "captain",
          },
        });
      }

      if (supabaseLobbyData.blue_first_mate) {
        existingPlayers.push({
          data: {
            name: supabaseLobbyData.blue_first_mate,
            team: "blue",
            role: "first-mate",
          },
        });
      }

      if (supabaseLobbyData.blue_engineer) {
        existingPlayers.push({
          data: {
            name: supabaseLobbyData.blue_engineer,
            team: "blue",
            role: "engineer",
          },
        });
      }

      if (supabaseLobbyData.blue_radio_operator) {
        existingPlayers.push({
          data: {
            name: supabaseLobbyData.blue_radio_operator,
            team: "blue",
            role: "radio-operator",
          },
        });
      }

      if (supabaseLobbyData.red_captain) {
        existingPlayers.push({
          data: {
            name: supabaseLobbyData.red_captain,
            team: "red",
            role: "captain",
          },
        });
      }

      if (supabaseLobbyData.red_first_mate) {
        existingPlayers.push({
          data: {
            name: supabaseLobbyData.red_first_mate,
            team: "red",
            role: "first-mate",
          },
        });
      }

      if (supabaseLobbyData.red_engineer) {
        existingPlayers.push({
          data: {
            name: supabaseLobbyData.red_engineer,
            team: "red",
            role: "engineer",
          },
        });
      }

      if (supabaseLobbyData.red_radio_operator) {
        existingPlayers.push({
          data: {
            name: supabaseLobbyData.red_radio_operator,
            team: "red",
            role: "radio-operator",
          },
        });
      }

      setRoomPlayers([
        ...existingPlayers,
        ...presenceData.filter((player) => player.data.roomCode === roomCode),
      ]);
    } else {
      setRoomPlayers(
        presenceData.filter((player) => player.data.roomCode === roomCode),
      );
    }
  }, [presenceData]);

  const handleLeaveRoom = () => {
    setNetworkState({ type: "currentStage", value: "main-menu" });
  };

  const handleRoleClick = (selectedTeam, selectedRole) => {
    const playerSelected = roomPlayers.find((player) => {
      return (
        player.data.team === selectedTeam && player.data.role === selectedRole
      );
    });

    if (!playerSelected) {
      setPlayerTeam(selectedTeam);
      setPlayerRole(selectedRole);
      updateStatus({
        name: username,
        roomCode: roomCode,
        team: selectedTeam,
        role: selectedRole,
      });
    } else if (playerSelected.clientId === selfClientId) {
      setPlayerTeam(null);
      setPlayerRole(null);
      updateStatus({
        name: username,
        roomCode: roomCode,
        team: null,
        role: null,
      });
    }
  };

  const handleBeginMatch = () => {
    channel.publish("start-game", { gameId: uuidv4(), roomCode: roomCode });
  };

  const handleJoinInProgressMatch = () => {
    channel.publish("start-game", {
      gameId: supabaseLobbyData.channel_id,
      roomCode: roomCode,
    });
  };

  return (
    <div style={styles.main}>
      <div style={styles.container}>
        <div style={{ ...styles.column, width: "200px" }}>
          <h2 style={styles.unassignedHeader}>Unassigned:</h2>
          {roomPlayers
            .filter((player) => !player.data.role)
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
            <button style={styles.leaveRoomButton} onClick={handleLeaveRoom}>
              Leave Room
            </button>
          </div>
          <button
            style={
              (!inProgressGame &&
                roomPlayers.length < process.env.NUM_REQUIRED_PLAYERS) ||
              roomPlayers.filter((player) => !player.data.role).length > 0 ||
              !playerRole
                ? styles.disabledButton
                : styles.beginMatchButton
            }
            disabled={
              (!inProgressGame &&
                roomPlayers.length < process.env.NUM_REQUIRED_PLAYERS) ||
              roomPlayers.filter((player) => !player.data.role).length > 0 ||
              !playerRole
            }
            onClick={
              inProgressGame ? handleJoinInProgressMatch : handleBeginMatch
            }
          >
            {inProgressGame ? "Join Match" : "Begin Match"}
          </button>
        </div>
      </div>
    </div>
  );
}
