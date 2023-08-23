import React, { useState } from 'react'; // Import useState
import Modal from 'react-modal'
import { useGameContext } from "@/app/state/game_state";
import theme from "@/app/styles/theme";
import { capitalizeFirstLetter } from "@/app/utils";
import RepairGame from "./RepairGame";


export default function SystemDamage(props){
    const { system, channel } = props;

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

    }

    const {
        systemChargeLevels,
        pendingNavigate,
        pendingSystemDamage,
        playerTeam,
    } = useGameContext();

    // THIS IS CODE FOR CHANGING THE LENGTH AND WIDTH OF THE RECTANGLE
    const [innerRectangleWidth, setInnerRectangleWidth] = useState('100%');

    const clickable = pendingNavigate[playerTeam] &&
        !pendingSystemDamage[playerTeam] ;   // Can add other statements to see if it can be clickable

    const handleClick = () => {
        const currentWidth = parseFloat(innerRectangleWidth);
        const newWidth = Math.max(currentWidth -20, 0);
        console.log(newWidth);
        setInnerRectangleWidth(`${newWidth}%`); 
        channel.publish("engineer-choose-system-damage", {system: system.name});
    };


   // THIS IS THE CODE FOR THE POP UP MINI GAME WINDOW
//    Modal.setAppElement(el)
    const [isRepairModalOpen, setIsRepairModalOpen] = useState(false);

    const handleRepairClick = () => {
        setIsRepairModalOpen(true);
    };

    const closeRepairModal = () => {
        setIsRepairModalOpen(false);
    };

    return (
        <div style={styles.container}>
            <span style={styles.buttonText}>{capitalizeFirstLetter(system.name)}</span>
                <div style={clickable ? styles.clickableRectangleBorder : styles.rectangleBorder} onClick={clickable ? handleClick : null}>
                    <div style = {{...styles.rectangle, width: innerRectangleWidth}}></div>
                </div>
                <button style = {styles.button} onClick={handleRepairClick}>
                    Repair
                </button>

            {/* Repair Modal */}
            <Modal
                isOpen={isRepairModalOpen}
                onRequestClose={closeRepairModal}
                contentLabel="Repair Modal"
                style= {{
                    content: {
                        background: theme.black,
                    }
                }}
            >
                <RepairGame> </RepairGame>
                <button onClick={closeRepairModal}>Close</button>
            </Modal>
        </div>
    );
}