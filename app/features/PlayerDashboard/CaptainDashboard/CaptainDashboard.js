import GameMap from "@/app/components/GameMap/GameMap";
import SectorsKey from "@/app/components/SectorsKey/SectorsKey";
import SystemChargeMeter from "@/app/components/SystemChargeMeter/SystemChargeMeter";
import MovementPendingCard from "./MovementPendingCard";
import theme from "@/app/styles/theme";
import { useGameContext } from "@/app/state/game_state";
import TriangleMoveButton from "./TriangleMoveButton";
import { SYSTEMS_INFO } from "@/app/utils";
import React, { useEffect, useState } from "react";

import {isNavigationDisabled} from "./NavigationUtils";
import { easing } from "@mui/material";
import { East } from "@mui/icons-material";

export default function CaptainDashboard(props){

    const styles = {
        main: {
            width: "100%",
            height: "100%",
            flexGrow: 1,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
        },
        container: {
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
        },
        controls: {
            width: "300px",
            height: "450px",
            marginLeft: "40px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            alignItems: "center",
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
        directionText: {
            margin: "10px",
        },
        silenceControls: {
            width: "100%",
            height: "50px",
            marginBottom: "20px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
        },
        surfaceButton: {
            backgroundColor: theme.black,
            border: "none",
            color: theme.white,
            textDecoration: "none",
            fontFamily: "'VT323', monospace",
            fontSize: "24px",
        },
        silenceButton: {
            backgroundColor: theme.black,
            border: "none",
            textDecoration: "none",
            fontFamily: "'VT323', monospace",
            fontSize: "24px",
        },
    };

    const { channel } = props;

    const {
        playerTeam,
        pendingNavigate,
        systemChargeLevels,
        systemHealthLevels,
    } = useGameContext();


    //check to see if engine is broken
    const [brokenEngine, setBrokenEngine] = useState(false);
    const [randomEnabledDirection, setRandomEnabledDirection] = useState(null);

    const directions = ["north", "south", "west", "east"];
    const directionStates = {};
    

    directions.forEach((direction) => {
        directionStates[direction] = isNavigationDisabled({ direction, channel, brokenEngine });
    });
    console.log(directionStates);


    useEffect(() => {
        console.log(`Engine Health: ${systemHealthLevels[playerTeam].engine}`);
        if(systemHealthLevels[playerTeam].engine >0){
            setBrokenEngine(false);
        }
        else {
            setBrokenEngine(true);  
            const trueDirections = Object.keys(directionStates).filter((direction)=> directionStates[direction] === false);
            
            const randomIndex = Math.floor(Math.random() * trueDirections.length);
            console.log(randomIndex);
            setRandomEnabledDirection(trueDirections[randomIndex]);
            console.log(`Random Direction: ${randomEnabledDirection}`)
               
        }
    }, [systemHealthLevels[playerTeam]]);

    const [silenceActivated, setSilenceActivated] = useState(false);

    const silenceCharged = systemChargeLevels[playerTeam].silence === SYSTEMS_INFO.find(system => system.name === "silence").maxCharge;

    const silenceStateStyle = {
        color: !silenceCharged ? theme.gray : (silenceActivated ? theme.purple : theme.white),
        cursor: silenceCharged ? "pointer" : "default",
    }

    const handleSilence = (row, column) => {
        channel?.publish("captain-silence", { row, column });
    };

    const handleClickSilence = () => {
        if(silenceCharged){
            setSilenceActivated(!silenceActivated);
        }
    };

    const handleClickSurface = () => {
        channel.publish("captain-surface", {});   
    }

    useEffect(() => {
        // If we've just used silence, turn off the cell selector
        if(systemChargeLevels[playerTeam].silence === 0){
            setSilenceActivated(false);
        }
    }, [systemChargeLevels[playerTeam].silence]);

    return (
        <div style={styles.main}>
            <div style={styles.container}>
                <SectorsKey />
                <GameMap silence={silenceActivated} channel={channel}/>
                <div style={styles.controls}>
                    {brokenEngine ? (
                        <h3 style={{ color: "red" }}>
                            Engine is Broken
                            </h3>
                    ) : null}
                    {pendingNavigate[playerTeam] && <MovementPendingCard channel={channel}/>}
                    <div style={styles.navButtons}>
                        <div style={styles.navRow}><span>North</span></div>
                        <div style={styles.navRow}><TriangleMoveButton direction="north" channel={channel} brokenEngine={brokenEngine} disabled = {directionStates["north"]} enabledDirection={randomEnabledDirection}/></div>
                        <div style={styles.navRow}>
                            <span style={styles.directionText}>West</span>
                            <TriangleMoveButton direction="west" channel={channel} brokenEngine={brokenEngine} disabled = {directionStates["west"]} enabledDirection={randomEnabledDirection}/>
                            <div style={{height: "100%", width: "50px"}} />
                            <TriangleMoveButton direction="east" channel={channel} brokenEngine={brokenEngine} disabled = {directionStates["east"]} enabledDirection={randomEnabledDirection}/>
                            <span style={styles.directionText}>East</span>
                        </div>
                        <div style={styles.navRow}><TriangleMoveButton direction="south" channel={channel} brokenEngine={brokenEngine} disabled = {directionStates["south"]} enabledDirection={randomEnabledDirection}/></div>
                        <div style={styles.navRow}><span>South</span></div>
                    </div>
                    <div style={styles.silenceControls}>
                        <button
                            style={{...styles.silenceButton, ...silenceStateStyle}}
                            onClick={handleClickSilence}
                        >
                            {silenceActivated ? "Cancel" : "Activate Silence"}
                        </button>
                        <SystemChargeMeter systemName="silence"/>
                    </div>
                    <button style={styles.surfaceButton} onClick={handleClickSurface}>Surface</button>
                </div>
            </div>
        </div>
    );
}