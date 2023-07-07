"use client";

import { useGameContext } from '@/app/context/game_state';
import { useChannel, usePresence } from '@ably-labs/react-hooks'
import { useEffect, useState } from 'react';
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
    user: {
      margin: "5px",
    }
  };

  const { username, selfClientId, setGameId, setCurrentStage } = useGameContext();
  const [allUsers, setAllUsers] = useState([]);
  
  const [channel] = useChannel("depth-warfare-lobby", (message) => {
    console.log(message);

    if(message.name === "start-game"){
      setGameId(message.data.gameId);
      setCurrentStage("teams");
    }
  });
  const [presenceData] = usePresence("depth-warfare-lobby", username);
  
  useEffect(() => {
    console.log(presenceData);
    setAllUsers(presenceData);

    if(presenceData.length === 8 && selfClientId === presenceData[0].clientId){
      channel.publish("start-game", {gameId: uuidv4()});
    }
  }, [presenceData]);

  return (
    <div style={styles.main}>
      <div style={styles.container}>
        <h4>Waiting for more players...</h4>
        {
          allUsers.map((user, index) => (
            <p key={index} style={styles.user}>{user.data}</p>
          ))
        }
      </div>
    </div>
  );
}
