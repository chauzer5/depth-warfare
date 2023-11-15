import theme from "@/app/styles/theme";
import { ROLE_MAP } from "@/app/utils";

export default function RoleButton(props) {
  const { id, team, role, handleClick, roomPlayers } = props;
  const playerSelected = roomPlayers.find((player) => {
    return player.data.team === team && player.data.role === role;
  });

  const styles = {
    button: {
      width: "230px",
      height: "50px",
      backgroundColor: "black",
      border: `2px solid ${team}`,
      color: theme.white,
      fontFamily: "'VT323', monospace",
      fontSize: "24px",
      marginBottom: "10px",
      textAlign: "left",
      margin: 0,
      paddingLeft: "15px",
    },
    label: {
      color: playerSelected ? theme.white : team,
      fontSize: "24px",
      fontFamily: "'VT323', monospace",
      margin: "5px",
      marginTop: "10px",
    },
  };

  return (
    <>
      <h2 style={styles.label}>{ROLE_MAP[role]}</h2>
      <button style={styles.button} onClick={() => handleClick(team, role)} id={id}>
        {playerSelected?.data.name ? playerSelected.data.name : ""}
      </button>
    </>
  );
}
