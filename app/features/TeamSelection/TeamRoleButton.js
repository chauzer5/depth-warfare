import { useGameContext } from "../../context/game_state";
import theme from "@/app/styles/theme";

export default function TeamRoleButton (props) {
    const {
        presenceData,
        handleClick,
        team,
        role,
    } = props;

    const { selfClientId } = useGameContext();

    const playerSelected = presenceData.find((player) => {
        return (player.data.team === team && player.data.role === role);
    });

    const buttonColor = playerSelected?.clientId === selfClientId ? theme.green : team;
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
        }
    };

    const roleMap = {
        "captain": "Captain",
        "first-mate": "First Mate",
        "engineer": "Engineer",
        "radio-operator": "Radio Operator",
    };

    return (
        <button style={styles.button} onClick={() => handleClick(team, role)}>
            {`${roleMap[role]}${playerSelected?.data.name ? ` (${playerSelected.data.name})` : ""}`}
        </button>
    );
}