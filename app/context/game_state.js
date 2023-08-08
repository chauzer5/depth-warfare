"use client";

import { createContext, useContext, useState } from "react";
import { configureAbly } from "@ably-labs/react-hooks";
import { v4 as uuidv4 } from "uuid";
import { maps } from "../maps";
import theme from "../styles/theme";

const selfClientId = uuidv4();
configureAbly({ key: "2KJZGA.aX_e0g:13USKhuP_xe_jQEIP1eUmkGsau-UUNCITFKa-ZqiU1A", clientId: selfClientId });

const GameContext = createContext();

export function GameWrapper({children}) {
    const STARTING_HIT_POINTS = 4;
    const ISLAND_MAP = "map1";

    const islandList = maps[ISLAND_MAP];
    const [username, setUsername] = useState();
    const [currentStage, setCurrentStage] = useState("login");
    const [gameId, setGameId] = useState();
    const [playerTeam, setPlayerTeam] = useState();
    const [playerRole, setPlayerRole] = useState();
    const [gameMap, setGameMap] = useState();
    const [playerData, setPlayerData] = useState();
    const [subLocations, setSubLocations] = useState({ blue: null, red: null });
    const [minesList, setMinesList] = useState({ blue: [], red: [] });
    const [hitPoints, setHitPoints] = useState({ blue: STARTING_HIT_POINTS, red: STARTING_HIT_POINTS });
    

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
        }}>
            {children}
        </GameContext.Provider>
    )
}

export function useGameContext(){ return useContext(GameContext); }