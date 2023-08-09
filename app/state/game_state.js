"use client";

import { createContext, useContext, useState } from "react";
import { configureAbly } from "@ably-labs/react-hooks";
import { v4 as uuidv4 } from "uuid";
import { maps } from "../maps";
import { columnToIndex, rowToIndex } from "../utils";

const selfClientId = uuidv4();
configureAbly({ key: "2KJZGA.aX_e0g:13USKhuP_xe_jQEIP1eUmkGsau-UUNCITFKa-ZqiU1A", clientId: selfClientId });

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

    const getMessagePlayer = (message) => {
        const messageSender = playerData.find((player) => player.clientId === message.clientId);
        return messageSender;
    };

    const moveSub = (team, row, column) => {
        const mapCopy = [...gameMap];

        // remove the old position and make it visited
        if(subLocations[team]){
            const prevContents = gameMap[subLocations[team][0]][subLocations[team][1]];
            const newContents = { ...prevContents, [`${team}Sub`]: false, [`${team}Visited`]: true };
            mapCopy[subLocations[team][0]][subLocations[team][1]] = newContents;
        }

        // add the new position
        const prevContents = gameMap[row][column];
        const newContents = { ...prevContents, [`${team}Sub`]: true };
        mapCopy[row][column] = newContents;

        setSubLocations({ ...subLocations, [team]: [row, column] });
        setGameMap(mapCopy);
    };

    const resetMap = () => {
        let blankGameMap = Array(process.env.MAP_DIMENSION);
        for(let i = 0; i < process.env.MAP_DIMENSION; i++){
            blankGameMap[i] = Array(process.env.MAP_DIMENSION).fill({
                type: "water",
                blueVisited: false,
                redVisited: false,
                redSub: false,
                blueSub: false,
                redMine: false,
                blueMine: false,
            });
        }

        islandList.forEach((spot) => {
            blankGameMap[rowToIndex(spot[1])][columnToIndex(spot[0])] = { type: "island" };
        });

        setGameMap(blankGameMap);
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
            setPlayerData,
            getMessagePlayer,
            setPendingNavigate,
            setPendingSystemDamage,
            setPendingSystemCharge,
            resetMap,
        }}>
            {children}
        </GameContext.Provider>
    )
}

export function useGameContext(){ return useContext(GameContext); }