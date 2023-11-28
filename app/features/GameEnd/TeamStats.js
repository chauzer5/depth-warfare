import { useGameContext } from "@/app/state/game_state";
import theme from "@/app/styles/theme";
import { capitalizeFirstLetter } from "@/app/utils";

export default function TeamStats(props) {
  const { team } = props;
  const { networkState } = useGameContext();
  const { gameStats, systemHealthLevels } = networkState;

  const styles = {
    main: {
      margin: "20px",
    },
    header: {
      color: theme[team],
      fontSize: "28px",
    },
    stat: {
      color: theme.white,
      fontSize: "24px",
      margin: 0,
    },
    number: {
      color: theme.green,
    }
  }

  return (
    <div style={styles.main}>
      <h2 style={styles.header}>{`${capitalizeFirstLetter(team)} team stats:`}</h2>
      <p style={styles.stat}>{`Remaining life support: `}
        <span style={styles.number}>
          {`${systemHealthLevels[team]["life support"]}/${process.env.STARTING_LIFE_SUPPORT}`}
        </span>
      </p>
      {/* <p style={styles.stat}>{`Spaces traveled: `}<span style={styles.number}>{gameStats[team].spacesTraveled}</span></p> */}
      <p style={styles.stat}>{`Mines deployed: `}<span style={styles.number}>{gameStats[team].minesDropped}</span></p>
      <p style={styles.stat}>{`Mines detonated: `}<span style={styles.number}>{gameStats[team].minesDetonated}</span></p>
      <p style={styles.stat}>{`Torpedoes launched: `}<span style={styles.number}>{gameStats[team].torpedoesLaunched}</span></p>
      <p style={styles.stat}>{`Times surfaced: `}<span style={styles.number}>{gameStats[team].timesSurfaced}</span></p>
      {/* <p style={styles.stat}>{`Systems disabled: `}<span style={styles.number}>{gameStats[team].systemsDisabled}</span></p> */}
      <p style={styles.stat}>{`Times boosted: `}<span style={styles.number}>{gameStats[team].timesBoosted}</span></p>
    </div>
  );
}