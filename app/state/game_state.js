"use client";

import { createContext, useContext, useState } from "react";
import { configureAbly } from "@ably-labs/react-hooks";
import { v4 as uuidv4 } from "uuid";
import { maps } from "../maps";
import { columnToIndex, rowToIndex } from "../utils";

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
                console.error(`Unrecognized direction: ${direction}`);
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

    const getValidSilenceCells = () => {
        const [row, column] = subLocations[playerTeam];
        const validCells = [];
        
        // Check 4 cells in the north direction
        for(let i = 1; i <= 4; i++){
            if(row - i < 0){ break; }
            if(gameMap[row - i][column].type === "island"){ break; }
            if(gameMap[row - i][column].visited[playerTeam]){ break; }

            validCells.push([row - i, column]);
        }

        // Check 4 cells in the east direction
        for(let i = 1; i <= 4; i++){
            if(column + i >= process.env.MAP_DIMENSION){ break; }
            if(gameMap[row][column + i].type === "island"){ break; }
            if(gameMap[row][column + i].visited[playerTeam]){ break; }

            validCells.push([row, column + i]);
        }

        // Check 4 cells in the south direction
        for(let i = 1; i <= 4; i++){
            if(row + i >= process.env.MAP_DIMENSION){ break; }
            if(gameMap[row + i][column].type === "island"){ break; }
            if(gameMap[row + i][column].visited[playerTeam]){ break; }

            validCells.push([row + i, column]);
        }

        // Check 4 cells in the west direction
        for(let i = 1; i <= 4; i++){
            if(column - i < 0){ break; }
            if(gameMap[row][column - i].type === "island"){ break; }
            if(gameMap[row][column - i].visited[playerTeam]){ break; }

            validCells.push([row, column - i]);
        }

        return validCells;
    };

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
            playerData,
            pendingNavigate,
            pendingSystemDamage,
            pendingSystemCharge,
            systemChargeLevels,
            systemHealthLevels,
            radioMapNotes,
            enemyMovements,
            getValidSilenceCells,
            setCurrentStage,
            setUsername,
            setGameId,
            setPlayerTeam,
            setPlayerRole,
            setMinesList,
            setSubLocations,
            setHitPoints,
            setGameMap,
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
            setRadioMapNotes,
            setEnemyMovements,
        }}>
            {children}
        </GameContext.Provider>
    )
}

export function useGameContext(){ return useContext(GameContext); }