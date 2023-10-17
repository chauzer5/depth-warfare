import RoleButton from "./RoleButton";

export default function MatchLobby() {
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
      flexDirection: "row",

    },
    column: {
      display: "flex",
      flexDirection: "column",
      width: "250px",
      backgroundColor: "white",
      margin: "10px",
    }
  };

  return (
    <div style={styles.main}>
      <div style={styles.container}>
        <div style={styles.column}>
          <h2>Unassigned:</h2>
          <p>Chauzer</p>
          <p>Jippsmith</p>
          <p>MoodyJam</p>
          <p>Vader</p>
          <p>Sauron</p>
          <p>Zerg</p>
          <p>Voldemort</p>
        </div>
        <div style={styles.column}>
          <RoleButton />
          <RoleButton />
          <RoleButton />
          <RoleButton />
        </div>
        <div style={styles.column}>
          <RoleButton />
          <RoleButton />
          <RoleButton />
          <RoleButton />
        </div>
        <div style={styles.column}>
          <h2>ROOM CODE:</h2>
          <h1>LKEK</h1>
          <button>Leave Room</button>
          <button>Begin Match</button>
        </div>
      </div>
    </div>
  );
}