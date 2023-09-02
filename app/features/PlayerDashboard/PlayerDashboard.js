import React, {useState, useEffect} from 'react';
import Modal from 'react-modal';
import SurfacingPage from './SurfacingPage';
import theme from "@/app/styles/theme";

import { useGameContext } from "@/app/state/game_state";
import DashboardHeader from "./DashboardHeader";
import CaptainDashboard from "./CaptainDashboard/CaptainDashboard";
import EngineerDashboard from "./EngineerDashboard/EngineerDashboard";
import FirstMateDashboard from "./FirstMateDashboard/FirstMateDashboard";
import RadioOperatorDashboard from "./RadioOperatorDashboard/RadioOperatorDashboard";

export default function PlayerDashboard(props){
    const { playerRole, currentlySurfacing, setCurrentlySurfacing, playerTeam, notificationMessages, notify} = useGameContext();
    const { channel } = props;

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


    const openModal = () => {
        setCurrentlySurfacing(true);
    };

    const closeModal = () => {
        setCurrentlySurfacing(false);
    }

    const [lastSeenMessage, setLastSeenMessage] = useState(null);

    // When new messages are received, filter and update the state
    useEffect(() => {
        const filteredMessages = notificationMessages.filter((message) => {
            // Check if the message is newer than the last seen message
            return message.timestamp > lastSeenMessage;
        });

        // Update the last seen message to the highest timestamp among new messages
        if (filteredMessages.length > 0) {
            const highestTimestamp = Math.max(...filteredMessages.map((message) => message.timestamp));
            setLastSeenMessage(highestTimestamp);
        }
        console.log("notificationMessages", notificationMessages)
        console.log("filterdMessages", filteredMessages)

        const transformedMessages = filteredMessages.map((message) => {
            // Transform the message or perform an action
            console.log("check", playerRole, playerTeam)
            if (message.intendedPlayer === playerRole || message.intendedPlayer === "all") {
                if (playerTeam === message.team) {
                    console.log("should have notified")
                    notify(`${message.sameTeamMessage}`, message.severitySameTeam)
                } 
                if (playerTeam !== message.team && message.oppTeamMessage) {
                    notify(`${message.oppTeamMessage}`, message.severityOppTeam)
                }
            }
            // You can replace this return statement with your custom logic
        });

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