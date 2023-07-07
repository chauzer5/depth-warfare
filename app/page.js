"use client";

// import { useRouter } from "next/navigation";
import { useGameContext } from "./context/game_state";
import Link from "next/link";

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
      // border: "none",
      color: "white",
      marginTop: "100px",
      // fontFamily: "'Stalinist One', cursive",
      fontSize: "26px",
      // backgroundColor: "black",
      textDecoration: "none",
    },
  }

  // const router = useRouter();

  const {
    username,
    setUsername,
  } = useGameContext();

  const handleChangeUsername = (event) => {
    setUsername(event.target.value);
  };

  // const handleSubmit = (e) => {
  //   e.preventDefault();
  //   console.log(username);
  //   router.push("/lobby");
  // };

  return (
      <div style={styles.main}>
        <label>Username</label>
        <input style={styles.usernameInput} type="text" onChange={handleChangeUsername}/>
        <Link style={styles.lobbyButton} href="/lobby">Enter Lobby</Link>
      </div>
  );
}
