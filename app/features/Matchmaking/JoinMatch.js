import { useGameContext } from "@/app/state/game_state";
import theme from "@/app/styles/theme";

export default function JoinMatch() {
  const styles = {
    main: {
      width: "100%",
      height: "100vh",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
    },
    roomCodeInput: {
      width: "400px",
      height: "50px",
      border: `solid 3px ${theme.green}`,
      backgroundColor: theme.black,
      color: theme.green,
      textAlign: "center",
      fontSize: "20px",
      fontFamily: "'VT323', monospace",
    },
    joinButton: {
      border: "none",
      color: theme.white,
      marginTop: "100px",
      fontSize: "26px",
      backgroundColor: theme.black,
      textDecoration: "none",
      fontFamily: "'VT323', monospace",
    },
  };

  const { roomCode, setRoomCode, setNetworkState } = useGameContext();

  const handleChangeRoomCode = (event) => {
    setRoomCode(event.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setNetworkState({ type: "currentStage", value: "match-lobby" });
  };

  return (
    <form style={styles.main} onSubmit={handleSubmit}>
      <label>Room Code</label>
      <input
        style={styles.roomCodeInput}
        type="text"
        onChange={handleChangeRoomCode}
        autoFocus
        maxLength={process.env.ROOM_CODE_LENGTH}
        value={roomCode}
      />
      <button style={styles.joinButton} type="submit">
        Join
      </button>
    </form>
  );
}