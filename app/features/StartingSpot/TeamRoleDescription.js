import { useGameContext } from "@/app/state/game_state";
import theme from "@/app/styles/theme";

export default function TeamRoleDescription () {
    const { playerTeam, playerRole } = useGameContext();

    const roleMap = {
        "captain": "Captain",
        "first-mate": "First Mate",
        "engineer": "Engineer",
        "radio-operator": "Radio Operator",
    };

    const styles = {
        role: {
            color: theme.white,
        },
        team: {
            color: playerTeam,
        },
    };

    return (
        <h3>You are <span style={styles.role}>{roleMap[playerRole]}</span> for the
        <span style={styles.team}>{` ${playerTeam.charAt(0).toUpperCase() + playerTeam.slice(1)} Team`}</span></h3>
    );
}