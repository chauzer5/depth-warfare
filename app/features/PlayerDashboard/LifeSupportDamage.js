import { useGameContext } from "@/app/state/game_state";
import theme from "@/app/styles/theme";
import { capitalizeFirstLetter } from "@/app/utils";
import { useEffect, useState } from "react";

export default function LifeSupportDamage() {

  const styles = {
    container: {
      display: "flex",
      alignItems: "center",
      justifyContent: "flex-start",
      width: "250px",
      marginTop: "2px",
      marginBottom: "0px",
			backgroundColor: theme.black,
    },
    buttonText: {
      color: theme.white,
      fontSize: "24px",
    },
    "@keyframes blink": {
      "0%": { opacity: 1 },
      "49.99%": { opacity: 1 },
      "50%": { opacity: 0 },
      "99.99%": { opacity: 0 },
      "100%": { opacity: 1 },
    },
    rectangle: {
      height: "15px",
      backgroundColor: theme.white,
      leftborderRadius: "10px",
      marginRight: "0px",
      transition: "width 1s ease",
    },
		barContainer: {
      display: "flex",
			height: "15px",
      alignItems: "center",
      justifyContent: "flex-start",
      width: "100%", // Take full width to represent the total amount
      borderRadius: "10px", // Match the radius with the inner rectangle
      overflow: "hidden", // Ensure the inner bar doesn't overflow
			border: `2px solid ${theme.white}`,
      backgroundColor: theme.black, // Set a background color to indicate the empty part of the bar
    },
    textContainer: {
      width: "100px",
      overflow: "hidden",
      whiteSpace: "nowrap",
			backgroundColor: theme.black,
    },
  };

  const {
    playerTeam,
    calculateSystemNodeDistance,
    calculateMaxSystemHealth,
    networkState,
  } = useGameContext();

  const { systemHealthLevels, repairMatrix } = networkState;

  const [numChunks, setNumChunks] = useState(0);
  const [barWidth, setBarWidth] = useState(0);

  useEffect(() => {
    setBarWidth(
        Math.ceil(
            (systemHealthLevels[playerTeam]["life support"] * 100) /
            process.env.STARTING_LIFE_SUPPORT,
        ),
    );
  }, [systemHealthLevels[playerTeam]["life support"]]);

  return (
    <div style={styles.container}>
      <div style={{ ...styles.textContainer, width: "65px" }}>
				<span style={styles.buttonText}>
					Life:
				</span>
      </div>
      <div style={styles.container}>
				<div 
					style={{...styles.barContainer}}>
					<div
						style={{
							...styles.rectangle,
							width: `${barWidth}%`,
						}}
					></div>
				</div>
				<div style={{ ...styles.textContainer, width: "80px", marginLeft: "5px" }}>
					<span style={styles.buttonText}>
						{ (systemHealthLevels[playerTeam]["life support"] * 100) / process.env.STARTING_LIFE_SUPPORT }%
					</span>
				</div>
      </div>
    </div>
  );
}
