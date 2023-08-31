import { useGameContext } from "@/app/state/game_state";
import SystemActivator from "./SystemActivator";
import SectorsKey from "@/app/components/SectorsKey/SectorsKey";
import GameMap from "@/app/components/GameMap/GameMap";
import theme from "@/app/styles/theme";
import { SYSTEMS_INFO, capitalizeFirstLetter } from "@/app/utils";
import React, { useState, useEffect } from 'react';

export default function FirstMateDashboard(props){
    const styles = {
        main: {
            width: "100%",
            height: "100%",
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
        },
        systemsRow: {
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
        },
        pendingText: {
            color: theme.white,
            margin: 0,
            textAlign: "center",
            fontSize: "24px",
            width: "150px",
        },
        bottomSection: {
            height: "600px",
            marginTop: "20px",
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "flex-start",
        },
        controlsContainer: {
            width: "200px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start",
            alignItems: "center",
            padding: "20px",
        },
        systemButton: {
            width: "150px",
            height: "30px",
            margin: "10px",
            borderRadius: "5px",
            fontSize: "20px",
            fontWeight: "bold",
            color: "white",
            fontFamily: "VT323, monospace",
        },
        bigButton: {
            width: "150px",
            height: "150px",
            marginTop: "40px",
            borderRadius: "50%",
            fontSize: "30px",
            backgroundColor: "red",
            color: "black",
            fontFamily: "VT323, monospace",
        },
    };

    const { channel } = props;

    const {
        pendingNavigate,
        playerTeam,
        pendingSystemCharge,
        getFirstMateSystem,
        systemChargeLevels,
        getCellsDistanceAway,
        subLocations,
    } = useGameContext();

    const [toggledSystem, setToggledSystem] = useState('torpedo');
    const [clickedCell, setClickedCell] = useState({});
    const [torpedoCells, setTorpedoCells] = useState([]);

    useEffect(() => {
        if(toggledSystem === 'torpedo'){
            const [startRow, startCol] = subLocations[playerTeam];
            const newTorpedoCells = getCellsDistanceAway(startRow, startCol, process.env.TORPEDO_RANGE);
            setTorpedoCells(newTorpedoCells);
        }
    }, [pendingNavigate[playerTeam]]);

    const handleMapSelector = (cell, row, column) => {
        if (cell.type != "island") {
            const newClickedCell = { row, column };
            setClickedCell(newClickedCell);
        }
        
    };

    const launchSystem = (systemName) => {
        // Your logic for handling the button click goes here
        if (systemName === 'torpedo') {
            channel.publish("first-mate-fire-torpedo", clickedCell);
        }
        
        // You can perform any actions you need here
      };

    const isSystemCharged = (systemName) => {
        return systemChargeLevels[playerTeam][systemName] === getFirstMateSystem(systemName).maxCharge
    }

    const validTorpedoSelection = clickedCell && torpedoCells.find(cell => cell[0] === clickedCell.row && cell[1] === clickedCell.column)

    return (
        <div style={styles.main}>
            <div style={styles.systemsRow}>
                {SYSTEMS_INFO.map((system, index) => {
                    return (
                        <SystemActivator key={index} system={system} channel={channel}/>
                    );
                })}
                { pendingNavigate[playerTeam] && !pendingSystemCharge[playerTeam] && (
                    <div>
                        <h6 style={styles.pendingText}>{`MOVING: ${pendingNavigate[playerTeam].toUpperCase()}`}</h6>
                        <h6 style={styles.pendingText}>Choose a system to charge</h6>
                    </div>
                )}
                { pendingNavigate[playerTeam] && pendingSystemCharge[playerTeam] && (
                    <div>
                        <h6 style={styles.pendingText}>{`MOVING: ${pendingNavigate[playerTeam].toUpperCase()}`}</h6>
                        <h6 style={styles.pendingText}>Waiting for engineer...</h6>
                    </div>
                )}
            </div>
            <div style={styles.bottomSection}>
      <SectorsKey />
      <GameMap toggledSystem={toggledSystem} clickedCell={clickedCell} handleClick={handleMapSelector} torpedoCells={torpedoCells}/>
      <div style={styles.controlsContainer}>
                <button
                style={{
                    ...styles.systemButton,
                    backgroundColor: toggledSystem === 'torpedo' ? getFirstMateSystem('torpedo').color : 'black',
                    border: toggledSystem === 'torpedo' ? theme.white : `3px solid ${getFirstMateSystem('torpedo').color}`,
                }}
                onClick={() => setToggledSystem('torpedo')}
                >
                Torpedo
                </button>
                <button
                style={{
                    ...styles.systemButton,
                    backgroundColor: toggledSystem === 'mine' ? getFirstMateSystem('mine').color : 'black',
                    border: toggledSystem === 'mine' ? theme.white : `3px solid ${getFirstMateSystem('mine').color}`,
                }}
                onClick={() => setToggledSystem('mine')}
                >
                Mine
                </button>
                <button
                style={{
                    ...styles.systemButton,
                    backgroundColor: toggledSystem === 'scan' ? getFirstMateSystem('scan').color : 'black',
                    border: toggledSystem === 'scan' ? theme.white : `3px solid ${getFirstMateSystem('scan').color}`,
                }}
                onClick={() => setToggledSystem('scan')}
                >
                Scan
                </button>

                <button style={{
                ...styles.bigButton,
                backgroundColor: isSystemCharged('torpedo') && validTorpedoSelection && toggledSystem === 'torpedo'
                    ? "red"
                    : "gray",
                }}
                disabled={!isSystemCharged(toggledSystem) || (isSystemCharged('torpedo') && !validTorpedoSelection)}
                onClick={() => launchSystem(toggledSystem)}
                >
                {toggledSystem === 'torpedo' && validTorpedoSelection && isSystemCharged('torpedo')
                    ? "Launch Torpedo"
                    : toggledSystem === 'torpedo' && isSystemCharged('torpedo') && !validTorpedoSelection
                    ? "Invalid Selection"
                    : `Charge ${capitalizeFirstLetter(toggledSystem)}`}
                </button>
            </div>
            </div>
        </div>
    );
}

