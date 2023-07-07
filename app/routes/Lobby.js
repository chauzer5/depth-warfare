"use client";

import { useGameContext } from '@/app/context/game_state';
import { useChannel, usePresence } from '@ably-labs/react-hooks'
import { useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

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
    }
  };

  const NUM_PLAYERS_TO_START = 3;

  const { username, selfClientId, setGameId, setCurrentStage } = useGameContext();
  
  const [channel] = useChannel("depth-warfare-lobby", (message) => {
    if(message.name === "start-game"){
      setGameId(message.data.gameId);
      setCurrentStage("teams");
    }
  });

  const [presenceData] = usePresence("depth-warfare-lobby", {name: username});
  
  useEffect(() => {
    if(presenceData.length === NUM_PLAYERS_TO_START && selfClientId === presenceData[0].clientId){
      channel.publish("start-game", {gameId: uuidv4()});
    }
  }, [presenceData]);

  return (
    <div style={styles.main}>
      <div style={styles.container}>
        <h3>Waiting for more players...</h3>
        {
          presenceData.map((player, index) => (
            <p key={index} style={styles.player}>{player.data.name}</p>
          ))
        }
      </div>
    </div>
  );
}
