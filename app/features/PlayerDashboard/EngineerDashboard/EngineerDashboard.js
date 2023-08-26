import React, { useState, useEffect} from 'react';
import { useGameContext } from "@/app/state/game_state";
import theme from "@/app/styles/theme";
import SystemDamage from "./SystemDamage";
import RepairMatrix from "./RepairMatrix";
import { ENGINEER_SYSTEMS_INFO, ENGINEER_SYSTEMS_MAP } from "@/app/utils";
import TriangleKey from "./TriangleKey";

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
        },
        navButtons: {
          width: "100%",
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        },
        navRow: {
            width: "100%",
            height: "40px",
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            whiteSpace: "nowrap",
        },
        navRowWithMargin: {
          width: "100%",
          height: "40px",
          display: "flex",
          marginLeft: "10px",
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          whiteSpace: "nowrap",
      },
      pendingText: {
        color: theme.white,
        margin: 0,
        textAlign: "center",
        fontSize: "24px",
        width: "100%",
      },
    };

    const { channel } = props;

    const {
      pendingNavigate,
      playerTeam,
      pendingRepairMatrixBlock,
      systemChargeLevels,
    } = useGameContext();

    function capitalize(word) {
        return word.charAt(0).toUpperCase() + word.slice(1);
    }

    const findSystem = (direction) => {
      return ENGINEER_SYSTEMS_INFO.find(system => system.name === ENGINEER_SYSTEMS_MAP[direction])
    }


    
    return (
        <>

    <div style={styles.containerRow}>

        <div style = {styles.containerColumn}>
          { pendingNavigate[playerTeam] && !pendingRepairMatrixBlock[playerTeam] && (
              <div>
                  <h4 style={styles.pendingText}>{`MOVING: ${pendingNavigate[playerTeam].toUpperCase()}`}</h4>
                  <h4 style={styles.pendingText}>Choose a system to damage</h4>
              </div>
          )}
          { pendingNavigate[playerTeam] && pendingRepairMatrixBlock[playerTeam] && (
              <div>
                  <h4 style={styles.pendingText}>{`MOVING: ${pendingNavigate[playerTeam].toUpperCase()}`}</h4>
                  <h4 style={styles.pendingText}>Waiting for first mate...</h4>
              </div>
          )}

        <div style={{ marginTop: "20px" }}>
          <RepairMatrix channel={channel} current_system={ENGINEER_SYSTEMS_MAP[pendingNavigate[playerTeam]]} />
        </div>
       </div>
         
        <div style = {styles.containerColumn}>
          <div style = {styles.containerColumn}> 
            {ENGINEER_SYSTEMS_INFO.map((system, index) => {
                // const shouldShrink = system.name === ENGINEER_SYSTEMS_MAP[pendingNavigate[playerTeam]]
                return (
                    <SystemDamage key={index} system={system} channel={channel}/>
                );
            })}
          
          </div>
            <div style = {styles.containerRow}>
          
              <div style={styles.navButtons}>
                <div style={styles.navRow}>
                    <span style={{ color: findSystem("north").color }}>   
                        {capitalize(ENGINEER_SYSTEMS_MAP["north"])}
                    </span>
                </div>
                <div style={styles.navRow}>
                    <TriangleKey
                        direction="north"
                        color={findSystem("north").color}
                    />
                </div>
                <div style={styles.navRowWithMargin}>
                    <span style={{ color: findSystem("west").color, marginRight: "10px" }}>
                        {capitalize(ENGINEER_SYSTEMS_MAP["west"]) }
                    </span>
                    <TriangleKey
                        direction="west"
                        color={findSystem("west").color}
                    />
                    <div style={{ height: "100%", width: "50px" }} />
                    <TriangleKey
                        direction="east"
                        color={findSystem("east").color}
                    />
                    <span style={{ color: findSystem("east").color, marginLeft: "10px" }}>
                        { capitalize(ENGINEER_SYSTEMS_MAP["east"])}
                    </span>
                </div>
                <div style={styles.navRow}>
                    <TriangleKey
                        direction="south"
                        color={findSystem("south").color}
                    />
                </div>
                <div style={styles.navRow}>
                    <span style={{ color: findSystem("south").color }}>
                        {capitalize(ENGINEER_SYSTEMS_MAP["south"])}
                    </span>
                </div>
            </div>
            </div>
        </div>
   
    </div>
    </>
  );
}






