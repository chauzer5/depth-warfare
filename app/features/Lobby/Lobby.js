"use client";

import { useAblyContext } from "@/app/state/ably_state";
import { useGameContext } from "@/app/state/game_state";
import { useChannel, usePresence } from "@ably-labs/react-hooks";
import { useEffect } from "react";
import { v4 as uuidv4 } from "uuid";

export default function Lobby() {
  const styles = {
    main: {
      width: "100%",
      height: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    },
    container: {
      width: "650px",
      height: "450px",
      display: "flex",
      flexDirection: "column",
      justifyContent: "flex-start",
      alignItems: "center",
    },
    player: {
      margin: "5px",
    },
  };

  const { username, setGameId, setNetworkState } = useGameContext();
  const { selfClientId } = useAblyContext();

  const [channel] = useChannel("depth-warfare-lobby", (message) => {
    if (message.name === "start-game") {
      setGameId(message.data.gameId);
      setNetworkState({ type: "currentStage", value: "teams" })
    }
  });

  const [presenceData] = usePresence("depth-warfare-lobby", { name: username });

  useEffect(() => {
    if (
      presenceData.length === process.env.NUM_REQUIRED_PLAYERS &&
      selfClientId === presenceData[0].clientId
    ) {
      channel.publish("start-game", { gameId: uuidv4() });
    }
  }, [presenceData]);

  // Disables the context menu on right click if not running locally
  useEffect(() => {
    if (window.location.hostname !== "localhost") {
      document.addEventListener("contextmenu", (event) => {
        event.preventDefault();
      });
    }
  }, []);

  return (
    <div style={styles.main}>
      <div style={styles.container}>
        <h3>Waiting for more players...</h3>
        {presenceData.map((player, index) => (
          <p key={index} style={styles.player}>
            {player.data.name}
          </p>
        ))}
      </div>
    </div>
  );
}
