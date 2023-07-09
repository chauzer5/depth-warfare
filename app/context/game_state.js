"use client";

import { createContext, useContext, useState } from "react";
import { configureAbly } from "@ably-labs/react-hooks";
import { v4 as uuidv4 } from "uuid";
import { maps } from "../maps";

const selfClientId = uuidv4();
configureAbly({ key: "2KJZGA.aX_e0g:13USKhuP_xe_jQEIP1eUmkGsau-UUNCITFKa-ZqiU1A", clientId: selfClientId });

const GameContext = createContext();

export function GameWrapper({children}) {
    const STARTING_HIT_POINTS = 3;
    const ISLAND_MAP = "map1";


    const islandList = maps[ISLAND_MAP];
    const [username, setUsername] = useState();
    const [currentStage, setCurrentStage] = useState("login");
    const [gameId, setGameId] = useState();
    const [playerTeam, setPlayerTeam] = useState();
    const [playerRole, setPlayerRole] = useState();
    const [blueSubLocation, setBlueSubLocation] = useState();
    const [redSubLocation, setRedSubLocation] = useState();
    const [redMinesList, setRedMinesList] = useState([]);
    const [blueMinesList, setBlueMinesList] = useState([]);
    const [redHitPoints, setRedHitPoints] = useState(STARTING_HIT_POINTS);
    const [blueHitPoints, setBlueHitPoints] = useState(STARTING_HIT_POINTS);
    const [gameMap, setGameMap] = useState();

    return (
        <GameContext.Provider value={{
            selfClientId,
            currentStage,
            username,
            gameId,
            playerTeam,
            playerRole,
            islandList,
            blueMinesList,
            redMinesList,
            blueSubLocation,
            redSubLocation,
            blueHitPoints,
            redHitPoints,
            gameMap,
            setCurrentStage,
            setUsername,
            setGameId,
            setPlayerTeam,
            setPlayerRole,
            setBlueMinesList,
            setRedMinesList,
            setBlueSubLocation,
            setRedSubLocation,
            setBlueHitPoints,
            setRedHitPoints,
            setGameMap,
        }}>
            {children}
        </GameContext.Provider>
    )
}

export function useGameContext(){ return useContext(GameContext); }