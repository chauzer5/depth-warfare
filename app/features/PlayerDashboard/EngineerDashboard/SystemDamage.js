import React, { useState, useEffect, useRef } from 'react'; // Import useState
import { useGameContext } from "@/app/state/game_state";
import theme from "@/app/styles/theme";
import { capitalizeFirstLetter } from "@/app/utils";


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
        rectangle: {
            flex: 1,
            height: "15px",
            width: "100%",
            backgroundColor: system.color,      
            borderRadius: "15px",
            // border: "4px solid #0F0",
            marginRight: "10px",
            transition: "width 1s ease",
          },
          rectangleBorder: {
            flex: 1,
            height: "15px",
            backgroundColor: theme.black,      
            borderRadius: "18px",
            border: "4px solid ${system.color}",
            marginRight: "10px",
            transition: "width 1s ease",
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
        pendingSystemDamage,
        playerTeam,
    } = useGameContext();

    // THIS IS CODE FOR CHANGING THE LENGTH AND WIDTH OF THE RECTANGLE
    const [innerRectangleWidth, setInnerRectangleWidth] = useState('100%');

    useEffect(() => {
        if (shouldShrink && pendingNavigate[playerTeam]) {
            const intervalId = setInterval(() => {
                setInnerRectangleWidth(prevWidth => {
                    const newWidth = Math.max(parseFloat(prevWidth) - 20, 0);
                    if (newWidth <= 80) {
                        clearInterval(intervalId);
                    }
                    return `${newWidth}%`;
                });
            }, 100);

            return () => {
                clearInterval(intervalId);
            };
        }
    }, [shouldShrink, pendingNavigate, playerTeam]);


    return (
        <div style={styles.container}>
            <div style={{ ...styles.textContainer, width: "120px"}}>
                <span style={styles.buttonText}>
                    {capitalizeFirstLetter(system.name)}
                </span>
            </div>
            <div style={styles.rectangleBorder}>
                <div style={{ ...styles.rectangle, width: innerRectangleWidth }}></div>
            </div>
        </div>
    );
}