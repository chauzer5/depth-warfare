import React, { useState, useEffect, useRef } from 'react'; // Import useState
import { useGameContext } from "@/app/state/game_state";
import theme from "@/app/styles/theme";
import { capitalizeFirstLetter} from "@/app/utils";


export default function SystemDamage(props){
    const { system, channel, shouldShrink } = props;

    const styles = {
        main: {
            width: "90%",
            height: "150px",
            margin: "5px",
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
        },
        container: {
            display: "flex", /* Use flexbox to display children side by side */
            alignItems: "center", /* Align children vertically in the center */
            justifyContent: "flex-start",
            width: "90%", /* Set a fixed width for all the containers */
            margin: "5px", /* Center the containers on the page */
            marginBottom: "10px" /* Add some margin between each section */
          },
        button: {
            width: "80px",
            height: "30px",
            border: `5px solid ${system.color}`,
            color: system.color,
            backgroundColor: theme.black,
            borderRadius: "10px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            margin: "5px",
        },
        buttonText: {
            color: system.color,
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
            backgroundColor: system.color,      
            borderRadius: "15px",
            // border: "4px solid #0F0",
            marginRight: "10px",
            transition: "width 1s ease",
            animation: "blink 1s infinite",
            // backgroundColor: theme.white,
          },
          damageRectangle: {
            animation: "blink 1s infinite",
            backgroundColor: theme.white,
            "@keyframes blink": {
                "0%": { opacity: 1 },
                "49.99%": { opacity: 1 },
                "50%": { opacity: 0 },
                "99.99%": { opacity: 0 },
                "100%": { opacity: 1 },
            },
          },
          
          rectangleBorder: {
            height: "15px",
            backgroundColor: theme.black,      
            borderRadius: "18px",
            border: "4px solid ${system.color}",
            marginRight: "10px",
            // transition: "width 1s ease",
          },
          clickableRectangleBorder: {
            flex: 1,
            height: "15px",
            backgroundColor: theme.black,      
            borderRadius: "18px",
            border: "4px solid ${system.color}",
            marginRight: "10px",
            transition: "width 1s ease",
            cursor: "pointer",
            boxShadow: "0px 0px 8px 8px rgba(255,255,255,0.5)",
          },
          textContainer: {
            width: "100px", // Set a fixed width for the text container
            overflow: "hidden", // Hide overflowing text
            whiteSpace: "nowrap", // Prevent text wrapping
            textOverflow: "ellipsis", // Add ellipsis if text overflows
            },

    }

    const {
        systemChargeLevels,
        pendingNavigate,
        pendingRepairMatrixBlock,
        playerTeam,
        systemHealthLevels,
        engineerCompassMap,
    } = useGameContext();

    // const [pendingDamagedSystem, setPendingDamagedSystem] = useState(null)

    // useEffect(() => {
    //     setPendingDamagedSystem(engineerCompassMap[playerTeam][pendingNavigate[playerTeam]])
    // }, [pendingNavigate, playerTeam, engineerCompassMap]);

    const pendingDamagedSystem = engineerCompassMap[playerTeam][pendingNavigate[playerTeam]]

    function isPendingDamaged(system) {
        return system.name === pendingDamagedSystem;
    }

    return (
        <div style={styles.container}>
            <div style={{ ...styles.textContainer, width: "150px"}}>
                <span style={styles.buttonText}>
                    {capitalizeFirstLetter(system.name)}
                </span>
            </div>
            <div style={styles.container}>
                <div
                    style={{
                        ...styles.rectangle,
                        width: `${systemHealthLevels[playerTeam][system.name]}%`,
                    }}
                ></div>
            </div>
        </div>
    );
}