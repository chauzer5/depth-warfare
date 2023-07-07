import { useGameContext } from "../context/game_state";

export default function TeamRoleButton (props) {
    const {
        presenceData,
        handleClick,
        team,
        role,
    } = props;

    const { selfClientId } = useGameContext();

    const playerSelected = presenceData.filter((player) => {
        return (player.data.team === team && player.data.role === role);
    })[0];

    const buttonColor = playerSelected?.clientId === selfClientId ? "#45FF04" : team;
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