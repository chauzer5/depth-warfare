import { useGameContext } from "../../state/game_state";
import theme from "@/app/styles/theme";

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
      border: `solid 3px ${theme.green}`,
      backgroundColor: theme.black,
      color: theme.green,
      textAlign: "center",
      fontSize: "20px",
      fontFamily: "'VT323', monospace",
    },
    lobbyButton: {
      border: "none",
      color: theme.white,
      marginTop: "100px",
      fontSize: "26px",
      backgroundColor: theme.black,
      textDecoration: "none",
      fontFamily: "'VT323', monospace",
    },
  };

  const { setUsername, setNetworkState, username } = useGameContext();

  const handleChangeUsername = (event) => {
    setUsername(event.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setNetworkState({ type: "currentStage", value: "main-menu" });
  };

  return (
    <form style={styles.main} onSubmit={handleSubmit}>
      <label>Username</label>
      <input
        style={styles.usernameInput}
        type="text"
        onChange={handleChangeUsername}
        autoFocus
        maxLength={20}
        value={username}
      />
      <button style={styles.lobbyButton} type="submit">
        Enter
      </button>
    </form>
  );
}
