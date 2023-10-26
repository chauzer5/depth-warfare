import { useGameContext } from "@/app/state/game_state";
import theme from "@/app/styles/theme";
import { SYSTEMS_INFO } from "@/app/utils";

export default function SystemChargeMeter(props) {
  const { systemName, showPendingCharge } = props;

  const { playerTeam, networkState } = useGameContext();

  const { systemChargeLevels } = networkState;

  const selectedSystem = SYSTEMS_INFO.find((sys) => sys.name === systemName);

  const styles = {
    main: {
      display: "flex",
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
    },
  };

  const charges = Array(selectedSystem.maxCharge)
    .fill(0)
    .map((_, i) => {
      const cellStyle = {
        width: "18px",
        height: "8px",
        backgroundColor: theme.black,
        margin: "3px",
        border: `2px solid ${selectedSystem.color}`,
      };

      const filledStyle = {
        backgroundColor: selectedSystem.color,
      };

      const pendingStyle = {
        backgroundColor: theme.white,
      };

      let correctStyle;
      if (i < systemChargeLevels[playerTeam][systemName]) {
        correctStyle = { ...cellStyle, ...filledStyle };
      } else if (
        showPendingCharge &&
        i === systemChargeLevels[playerTeam][systemName]
      ) {
        correctStyle = { ...cellStyle, ...pendingStyle };
      } else {
        correctStyle = cellStyle;
      }

      return <div key={i} style={correctStyle}></div>;
    });

  return <div style={styles.main}>{charges}</div>;
}
