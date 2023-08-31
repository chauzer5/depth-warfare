import React, {useState} from 'react';
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
    const { playerRole, currentlySurfacing, setCurrentlySurfacing } = useGameContext();
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