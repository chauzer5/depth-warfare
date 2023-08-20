"use client";

import { createContext, useContext, useState } from "react";
import { configureAbly } from "@ably-labs/react-hooks";
import { v4 as uuidv4 } from "uuid";
import { maps } from "../maps";
import { columnToIndex, rowToIndex, ENGINEER_SYSTEMS_INFO } from "../utils";

const selfClientId = uuidv4();
configureAbly({ key: process.env.ABLY_API_KEY, clientId: selfClientId });

const GameContext = createContext();

export function GameWrapper({children}) {
    const islandList = maps[process.env.ISLAND_MAP];
    const [username, setUsername] = useState();
    const [currentStage, setCurrentStage] = useState("login");
    const [gameId, setGameId] = useState();
    const [playerTeam, setPlayerTeam] = useState();
    const [playerRole, setPlayerRole] = useState();
    const [gameMap, setGameMap] = useState();
    const [repairMatrix, setRepairMatrix] = useState([]);
    const [playerData, setPlayerData] = useState();
    const [subLocations, setSubLocations] = useState({ blue: null, red: null });
    const [minesList, setMinesList] = useState({ blue: [], red: [] });
    const [hitPoints, setHitPoints] = useState({ blue: process.env.STARTING_HIT_POINTS, red: process.env.STARTING_HIT_POINTS });
    const [pendingNavigate, setPendingNavigate] = useState({ blue: null, red: null });
    const [pendingSystemDamage, setPendingSystemDamage] = useState({ blue: null, red: null });
    const [pendingSystemCharge, setPendingSystemCharge] = useState({ blue: null, red: null });
    const [systemChargeLevels, setSystemChargeLevels] = useState({ 
        blue: {
            mine: 0,
            torpedo: 0,
            scan: 0,
            silence: 0,
        },
        red: {
            mine: 0,
            torpedo: 0,
            scan: 0,
            silence: 0,
        }
    });
    const [systemHealthLevels, setSystemHealthLevels] = useState({
        blue: {
            mine: process.env.MAX_SYSTEM_HEALTH,
            torpedo: process.env.MAX_SYSTEM_HEALTH,
            scan: process.env.MAX_SYSTEM_HEALTH,
            engine: process.env.MAX_SYSTEM_HEALTH,
            comms: process.env.MAX_SYSTEM_HEALTH,
        },
        red: {
            mine: process.env.MAX_SYSTEM_HEALTH,
            torpedo: process.env.MAX_SYSTEM_HEALTH,
            scan: process.env.MAX_SYSTEM_HEALTH,
            engine: process.env.MAX_SYSTEM_HEALTH,
            comms: process.env.MAX_SYSTEM_HEALTH,
        }
    });
    const [radioMapNotes, setRadioMapNotes] = useState([]);
    const [enemyMovements, setEnemyMovements] = useState([]);

    const getMessagePlayer = (message) => {
        const messageSender = playerData.find((player) => player.clientId === message.clientId);
        return messageSender;
    };

    const moveSub = (team, row, column) => {
        const mapCopy = [...gameMap];

        // remove the old position and make it visited
        if(subLocations[team]){
            const prevContents = gameMap[subLocations[team][0]][subLocations[team][1]];
            const newContents = {
                ...prevContents,
                subPresent: {
                    ...prevContents.subPresent,
                    [team]: false,
                },
                visited: {
                    ...prevContents.visited,
                    [team]: currentStage === "main" ? true : false,
                }
            };
            mapCopy[subLocations[team][0]][subLocations[team][1]] = newContents;
        }

        // add the new position
        const prevContents = gameMap[row][column];
        const newContents = { ...prevContents, subPresent: { ...prevContents.subPresent, [team]: true }};
        mapCopy[row][column] = newContents;

        setSubLocations({ ...subLocations, [team]: [row, column] });
        setGameMap(mapCopy);
    };

    const moveSubDirection = (team, direction) => {
        const [row, column] = subLocations[team];
        switch(direction){
            case "north":
                moveSub(team, row - 1, column);
                break;
            case "south":
                moveSub(team, row + 1, column);
                break;
            case "west":
                moveSub(team, row, column - 1);
                break;
            case "east":
                moveSub(team, row, column + 1);
                break;
            default:
                console.log(`Unrecognized direction: ${direction}`);
        }
    };

    const resetMap = () => {
        let blankGameMap = Array(process.env.MAP_DIMENSION);
        for(let i = 0; i < process.env.MAP_DIMENSION; i++){
            blankGameMap[i] = Array(process.env.MAP_DIMENSION).fill({
                type: "water",
                visited: {
                    blue: false,
                    red: false,
                },
                subPresent: {
                    blue: false,
                    red: false,
                },
                minePresent: {
                    blue: false,
                    red: false,
                },
            });
        }

        islandList.forEach((spot) => {
            blankGameMap[rowToIndex(spot[1])][columnToIndex(spot[0])] = { type: "island" };
        });

        setGameMap(blankGameMap);
        
    };

    const resetRepairMatrix = () => {
        const dimension = process.env.REPAIR_MATRIX_DIMENSION;
        const systems = ENGINEER_SYSTEMS_INFO.filter(system => system.name !== "life support").map(system => system.name);
        const doubledSystems = systems.concat(systems.slice());
        const extra_elements = dimension * 4

        while (doubledSystems.length < extra_elements) {
            doubledSystems.push("empty");
        }

        const shuffledSystems = shuffleArray(doubledSystems);
    
        let blankRepairMatrix = [];
    
        for (let i = 0; i < dimension + 2; i++) {
            let row = [];
            for (let j = 0; j < dimension + 2; j++) {
                if (i === 0 || i === dimension + 1 || j === 0 || j === dimension + 1) {
                    // Cells in the first row, last row, first column, and last column are "outer" cells
                    let system;

                    if ((i === 0 && j === 0) || (i === 0 && j === dimension + 1) || 
                    (i === dimension + 1 && j === 0) || (i === dimension + 1 && j === dimension + 1)) {
                        system = "empty"
                    } else {
                        system = shuffledSystems.pop();
                    }

                    row.push({
                        type: "outer",
                        system: system,
                    });
                } else {
                    row.push({
                        type: "inner",
                        system: "empty",
                    });
                }
            }
            blankRepairMatrix.push(row);
        }

        console.log("Finished Repair Matrix")
        console.log(blankRepairMatrix)
        
        setRepairMatrix(blankRepairMatrix); // Return the initialized matrix
    };
    
    // Function to shuffle an array using Fisher-Yates algorithm
    function shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    return (
        <GameContext.Provider value={{
            selfClientId,
            currentStage,
            username,
            gameId,
            playerTeam,
            playerRole,
            islandList,
            minesList,
            subLocations,
            hitPoints,
            gameMap,
            repairMatrix,
            playerData,
            pendingNavigate,
            pendingSystemDamage,
            pendingSystemCharge,
            systemChargeLevels,
            systemHealthLevels,
            radioMapNotes,
            enemyMovements,
            setCurrentStage,
            setUsername,
            setGameId,
            setPlayerTeam,
            setPlayerRole,
            setMinesList,
            setSubLocations,
            setHitPoints,
            setGameMap,
            setRepairMatrix,
            moveSub,
            moveSubDirection,
            setPlayerData,
            getMessagePlayer,
            setPendingNavigate,
            setPendingSystemDamage,
            setPendingSystemCharge,
            setSystemChargeLevels,
            setSystemHealthLevels,
            resetMap,
            resetRepairMatrix,
            setRadioMapNotes,
            setEnemyMovements,
        }}>
            {children}
        </GameContext.Provider>
    )
}

export function useGameContext(){ return useContext(GameContext); }