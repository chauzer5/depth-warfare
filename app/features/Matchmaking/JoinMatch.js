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
    disabledJoinButton: {
      color: theme.gray,
    }
  };

  const { roomCode, setRoomCode, setNetworkState } = useGameContext();

  const handleChangeRoomCode = (event) => {
    let regex = /^[a-zA-Z]+$/; 
    if(regex.test(event.target.value) || event.target.value === "") {
      setRoomCode(event.target.value.toUpperCase());
    }
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
      <button 
        style={roomCode?.length < 4 ? {...styles.joinButton, ...styles.disabledJoinButton} : styles.joinButton}
        type="submit"
        disabled={roomCode?.length < 4}
      >
        Join
      </button>
    </form>
  );
}