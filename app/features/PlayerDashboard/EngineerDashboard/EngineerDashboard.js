import React, { useState, useEffect} from 'react';
import { useGameContext } from "@/app/state/game_state";
import theme from "@/app/styles/theme";
import SystemDamage from "./SystemDamage";
import RepairMatrix from "./RepairMatrix";
import { ENGINEER_SYSTEMS_INFO, ENGINEER_SYSTEMS_MAP } from "@/app/utils";

const NUM_BUTTONS = 5;
const ACTIVE_BUTTONS = 3;

export default function EngineerDashboard(props){
    const styles = {
        systemLabel: {
            fontSize : "100px"
        },
        containerRow: {
            display: "flex", /* Use flexbox to display children side by side */
            alignItems: "center", /* Align children vertically in the center */
            justifyContent: "center",
            flexDirection: "row",
            width: "100%", /* Set a fixed width for all the containers */
            margin: "0 auto", /* Center the containers on the page */
            marginLeft: "20px", /* Add some margin between each section */
            marginRight: "20px",
          },
          containerColumn: {
            display: "flex", /* Use flexbox to display children side by side */
            alignItems: "center", /* Align children vertically in the center */
            flexDirection: "Column",
            width: "100%", /* Set a fixed width for all the containers */
            margin: "0 auto", /* Center the containers on the page */
            marginBottom: "5px",  /* Add some margin between each section */
            marginLeft: "5px",
          },
          label: {
            width: "100px", /* Set a fixed width for the labels */
            marginRight: "10px", /* Add some spacing between the label and the blue bar */
            fontSize: "30px",
          },
          placeHolderBox:{
            height: "500px", 
            width: "80%",
            backgroundColor: theme.green,
            color: theme.black,
            border: "10px solid ${theme.blue}"
          },
        
          trianglePlaceHolderBox:{
            height:"200px",
            width: "200px",
            backgroundColor: theme.green,
            color: theme.black,
        }
    };

    const { channel } = props;

    const {
      pendingNavigate,
      playerTeam,
      pendingSystemDamage,
      systemChargeLevels,
  } = useGameContext();


    
    return (
        <>

    <div style={styles.containerRow}>

       <RepairMatrix channel={channel} current_system={ENGINEER_SYSTEMS_MAP[pendingNavigate[playerTeam]]} />
         
        <div style = {styles.containerColumn}>
          <div style = {styles.containerColumn}> 
            {ENGINEER_SYSTEMS_INFO.map((system, index) => {
              const shouldShrink = pendingNavigate[playerTeam] && pendingSystemDamage[playerTeam] && system.name === ENGINEER_SYSTEMS_MAP[pendingNavigate[playerTeam]];
                return (
                    <SystemDamage key={index} system={system} channel={channel} shouldShrink={shouldShrink}/>
                );
            })}
          
          </div>
            <div style = {styles.containerRow}>
            
            { pendingNavigate[playerTeam] && !pendingSystemDamage[playerTeam] && (
                <div>
                    <h4 style={styles.pendingText}>{`MOVING: ${pendingNavigate[playerTeam].toUpperCase()}`}</h4>
                    <h4 style={styles.pendingText}>Choose a system to damage</h4>
                </div>
            )}
            { pendingNavigate[playerTeam] && pendingSystemDamage[playerTeam] && (
                <div>
                    <h4 style={styles.pendingText}>{`MOVING: ${pendingNavigate[playerTeam].toUpperCase()}`}</h4>
                    <h4 style={styles.pendingText}>Waiting for first mate...</h4>
                </div>
            )}
            <div style = {styles.trianglePlaceHolderBox}>
              Triangle stuff here
            </div>
            </div>
        </div>
   
    </div>
    </>
  );
}






