import React, {useState, useEffect} from 'react';
import Modal from 'react-modal';
import SurfacingPage from './SurfacingPage';
import theme from "@/app/styles/theme";
import { useSnackbar } from 'notistack';

import { useGameContext } from "@/app/state/game_state";
import DashboardHeader from "./DashboardHeader";
import CaptainDashboard from "./CaptainDashboard/CaptainDashboard";
import EngineerDashboard from "./EngineerDashboard/EngineerDashboard";
import FirstMateDashboard from "./FirstMateDashboard/FirstMateDashboard";
import RadioOperatorDashboard from "./RadioOperatorDashboard/RadioOperatorDashboard";

export default function PlayerDashboard(props){
    const { playerRole, currentlySurfacing, setCurrentlySurfacing, playerTeam, notificationMessages} = useGameContext();
    const { channel } = props;
    const { enqueueSnackbar } = useSnackbar();


    const styles={
        button: {
            height: "20px",
            width: "60px",
            backgroundColor: "#058800",
            color: "#0F0",
        },
        modalContent: {
            backgroundColor: "#000",
            color: "#0F0",
        },
    
    }; 

    const customModalSyles = {
        overlay: {
            backgroundColor: "rgba(0,0,0,.7)",
            display: "flex",
            alignItems: "center", 
            justifyContent: "center",

        },
        content : {
            backgroundColor: "#000",
            color: theme.green,
            display: "flex", 
            flexDirection: "column",
            alignItems: "center", 
            justifyContent: "center",
        }
    }

    // Function to add a message to the Snackbar
    const addMessageToSnackbar = (message, severity) => {
        enqueueSnackbar(message, {
        variant: severity, // You can customize the variant based on severity
        autoHideDuration: 5000, // Set the duration in milliseconds
        anchorOrigin: { vertical: 'bottom', horizontal: 'left' }, // Customize the position
        });
    };



    const openModal = () => {
        setCurrentlySurfacing(true);
    };

    const closeModal = () => {
        setCurrentlySurfacing(false);
    }

    const [lastSeenMessage, setLastSeenMessage] = useState(-1);

    // When new messages are received, filter and update the state
    useEffect(() => {
        const filteredMessages = notificationMessages.filter((message) => {
            // Check if the message is newer than the last seen message
            return message.timestamp > lastSeenMessage;
        });

        console.log("filteredMessages", filteredMessages, lastSeenMessage);
    
        // Update the last seen message to the highest timestamp among new messages
        if (filteredMessages.length > 0) {
            const highestTimestamp = Math.max(...filteredMessages.map((message) => message.timestamp));
            setLastSeenMessage(highestTimestamp);
        }
        console.log("notificationMessages", notificationMessages);
        
    
        // Accumulate filtered messages to display them all together
        const accumulatedMessages = [];
        
        for (const message of filteredMessages) {
            // Transform the message or perform an action
            console.log("check", playerRole, playerTeam);
            if (message.intendedPlayer === playerRole || message.intendedPlayer === "all") {
                if (playerTeam === message.team) {
                    console.log("should have notified");
                    console.log(message.sameTeamMessage, message.severitySameTeam);
                    accumulatedMessages.push({
                        message: message.sameTeamMessage,
                        severity: message.severitySameTeam,
                    });
                } 
                if (playerTeam !== message.team && message.oppTeamMessage) {
                    accumulatedMessages.push({
                        message: message.oppTeamMessage,
                        severity: message.severityOppTeam,
                    });
                }
            }
        }
    
        // Notify all accumulated messages
        if (accumulatedMessages.length > 0) {
            accumulatedMessages.forEach((message) => {
                addMessageToSnackbar(message.message, message.severity);
            });
        }
        
    }, [notificationMessages]);
    

    return (
        <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100vh' }}>
            <DashboardHeader />
            {/* Modal content */}
            <Modal isOpen={currentlySurfacing} 
                onRequestClose={closeModal}
                overlayClassName="custom-modal-overlay"
                style={customModalSyles}
                >
                <div style = {styles.modalContent}>
                    <SurfacingPage closeModal = {closeModal}></SurfacingPage>
                    {/* <button onClick={closeModal}>Close</button> */}
                </div>
            </Modal>
            {/* Render dashboard based on player role */}
            {playerRole === 'captain' ? <CaptainDashboard channel={channel} /> :
                playerRole === 'engineer' ? <EngineerDashboard channel={channel} /> :
                playerRole === 'first-mate' ? <FirstMateDashboard channel={channel} /> :
                playerRole === 'radio-operator' ? <RadioOperatorDashboard channel={channel} /> :
                null}
        </div>
    );
}