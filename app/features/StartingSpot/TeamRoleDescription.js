import { useGameContext } from "@/app/state/game_state";
import theme from "@/app/styles/theme";
import { ROLE_MAP } from "@/app/utils";

export default function TeamRoleDescription() {
  const { playerTeam, playerRole } = useGameContext();

  const styles = {
    role: {
      color: theme.white,
    },
    team: {
      color: playerTeam,
    },
  };

  return (
    <h3>
      You are <span style={styles.role}>{ROLE_MAP[playerRole]}</span> for the
      <span style={styles.team}>{` ${
        playerTeam.charAt(0).toUpperCase() + playerTeam.slice(1)
      } Team`}</span>
    </h3>
  );
}
