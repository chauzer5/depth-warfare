import { useGameContext } from "../../state/game_state";
import theme from "@/app/styles/theme";
import { ROLE_MAP } from "@/app/utils";

export default function TeamRoleButton(props) {
  const { presenceData, handleClick, team, role } = props;

  const { selfClientId } = useGameContext();

  const playerSelected = presenceData.find((player) => {
    return player.data.team === team && player.data.role === role;
  });

  const buttonColor =
    playerSelected?.clientId === selfClientId ? theme.green : team;
  const buttonStyle = playerSelected ? "dashed" : "solid";

  const styles = {
    button: {
      width: "300px",
      height: "50px",
      backgroundColor: "black",
      border: `2px ${buttonStyle} ${buttonColor}`,
      color: buttonColor,
      fontFamily: "'VT323', monospace",
      fontSize: "24px",
      marginBottom: "10px",
    },
  };

  return (
    <button style={styles.button} onClick={() => handleClick(team, role)}>
      {`${ROLE_MAP[role]}${
        playerSelected?.data.name ? ` (${playerSelected.data.name})` : ""
      }`}
    </button>
  );
}
