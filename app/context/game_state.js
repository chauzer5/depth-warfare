"use client";

import { createContext, useContext, useState } from "react";
import { configureAbly } from "@ably-labs/react-hooks";
import { v4 as uuidv4 } from "uuid";
import { maps } from "../maps";

const selfClientId = uuidv4();
configureAbly({ key: "2KJZGA.aX_e0g:13USKhuP_xe_jQEIP1eUmkGsau-UUNCITFKa-ZqiU1A", clientId: selfClientId });

const GameContext = createContext();

export function GameWrapper({children}) {
    const STARTING_HIT_POINTS = 4;
    const ISLAND_MAP = "map1";

    const SYSTEMS_INFO = [
        {
            name: "silence",
            color: "#9900FF",
            maxCharge: 6,
        },
        {
            name: "scan",
            color: "#00FF00",
            maxCharge: 4,
        },
        {
            name: "torpedo",
            color: "#FF0000",
            maxCharge: 4,
        },
        {
            name: "mine",
            color: "#FF9900",
            maxCharge: 3,
        }
    ];

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
    const [playerData, setPlayerData] = useState();

    const getMessagePlayer = (message) => {
        const messageSender = playerData.find((player) => player.clientId === message.clientId);
        return messageSender;
    };

    const moveBlueSub = (row, column) => {
        const mapCopy = [...gameMap];

        // remove the old position and make it visited
        if(blueSubLocation){
            const prevContents = gameMap[blueSubLocation[0]][blueSubLocation[1]];
            const newContents = { ...prevContents, blueSub: false, blueVisited: true };
            mapCopy[blueSubLocation[0]][blueSubLocation[1]] = newContents;
        }

        // add the new position
        const prevContents = gameMap[row][column];
        const newContents = { ...prevContents, blueSub: true };
        mapCopy[row][column] = newContents;

        setBlueSubLocation([row, column]);
        setGameMap(mapCopy);
    };

    const moveRedSub = (row, column) => {
        const mapCopy = [...gameMap];

        // remove the old position
        if(redSubLocation){
            const prevContents = gameMap[redSubLocation[0]][redSubLocation[1]];
            const newContents = { ...prevContents, redSub: false, redVisited: true };
            mapCopy[redSubLocation[0]][redSubLocation[1]] = newContents;
        }

        // add the new position
        const prevContents = gameMap[row][column];
        const newContents = { ...prevContents, redSub: true };
        mapCopy[row][column] = newContents;

        setRedSubLocation([row, column]);
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
            blueMinesList,
            redMinesList,
            blueSubLocation,
            redSubLocation,
            blueHitPoints,
            redHitPoints,
            gameMap,
            playerData,
            SYSTEMS_INFO,
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
            moveBlueSub,
            moveRedSub,
            setPlayerData,
            getMessagePlayer,
        }}>
            {children}
        </GameContext.Provider>
    )
}

export function useGameContext(){ return useContext(GameContext); }