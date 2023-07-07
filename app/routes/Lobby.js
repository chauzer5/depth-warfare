"use client";

import { useGameContext } from '@/app/context/game_state';
import { usePresence } from '@ably-labs/react-hooks'
import { useEffect, useState } from 'react';

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

  const { username } = useGameContext();
  const [allUsers, setAllUsers] = useState([]);
  if(username){ console.log(username); }
  const [presenceData] = usePresence("depth-warfare", username);
  
  useEffect(() => {
    console.log(presenceData);
    setAllUsers(presenceData);
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
