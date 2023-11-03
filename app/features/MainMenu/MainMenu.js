import { useGameContext } from "@/app/state/game_state";
import theme from "@/app/styles/theme";
import { generateRandomRoomCode } from "@/app/utils";

export default function MainMenu() {
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
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
    },
    title: {
      color: theme.white,
      marginTop: 0,
    },
    bigButton: {
      width: "250px",
      height: "50px",
      backgroundColor: "black",
      border: `3px solid #00FF00`,
      color: "#00FF00",
      fontFamily: "'VT323', monospace",
      fontSize: "24px",
      margin: 0,
      marginBottom: "10px",
    },
    username: {
      fontSize: "20px",
      marginBottom: "5px",
    },
    smallButton: {
      width: "150px",
      height: "30px",
      backgroundColor: "black",
      border: `2px solid #00FF00`,
      color: "#00FF00",
      fontFamily: "'VT323', monospace",
      fontSize: "16px",
      margin: 0,
      marginBottom: "10px",
    },
  };

  const { setNetworkState, username, setRoomCode } = useGameContext();

  const handleCreateMatch = () => {
    setRoomCode(generateRandomRoomCode());
    setNetworkState({ type: "currentStage", value: "match-lobby" });
  };

  const handleJoinMatch = () => {
    setNetworkState({ type: "currentStage", value: "join-match" });
  };

  const handleChangeUsername = () => {
    setNetworkState({ type: "currentStage", value: "login" });
  };

  return (
    <div style={styles.main}>
      <div style={styles.container}>
        <h1 style={styles.title}>DEPTH WARFARE</h1>
        <button style={styles.bigButton} id='createMatch' onClick={handleCreateMatch}>
          Create Match
        </button>
        <button style={styles.bigButton} id='joinMatch' onClick={handleJoinMatch}>
          Join Match
        </button>
        <p style={styles.username}>{`Username: ${username}`}</p>
        <button style={styles.smallButton} onClick={handleChangeUsername}>
          Change
        </button>
      </div>
    </div>
  );
}
