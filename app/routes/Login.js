"use client";

import { useGameContext } from "../context/game_state";

export default function Login() {

  const styles = {
    main: {
      width: "100%",
      height: "100vh",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
    },
    usernameInput: {
      width: "400px",
      height: "50px",
      border: "solid 3px #45FF04",
      backgroundColor: "black",
      color: "#45FF04",
      textAlign: "center",
      fontSize: "20px",
      fontFamily: "'VT323', monospace",
    },
    lobbyButton: {
      border: "none",
      color: "white",
      marginTop: "100px",
      fontSize: "26px",
      backgroundColor: "black",
      textDecoration: "none",
      fontFamily: "'VT323', monospace",
    },
  }

  const {
    username,
    setUsername,
    setCurrentStage,
  } = useGameContext();

  const handleChangeUsername = (event) => {
    setUsername(event.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(username);
    setCurrentStage("lobby");
  };

  return (
      <form style={styles.main} onSubmit={handleSubmit}>
        <label>Username</label>
        <input style={styles.usernameInput} type="text" onChange={handleChangeUsername}/>
        <button style={styles.lobbyButton} type="submit">Enter Lobby</button>
      </form>
  );
}