"use client";

import { createContext, useContext, useState } from "react";
import { configureAbly } from "@ably-labs/react-hooks";
import { v4 as uuidv4 } from "uuid";

const selfClientId = uuidv4();
configureAbly({ key: "2KJZGA.aX_e0g:13USKhuP_xe_jQEIP1eUmkGsau-UUNCITFKa-ZqiU1A", clientId: selfClientId });

const GameContext = createContext();

export function GameWrapper({children}) {
    const [playersList, setPlayersList] = useState([]);
    const [username, setUsername] = useState();
    const [currentStage, setCurrentStage] = useState("login");
    const [gameId, setGameId] = useState();

    const addPlayer = (player) => {
        setPlayersList((prev) => [...prev, player]);
    };

    return (
        <GameContext.Provider value={{
            currentStage,
            selfClientId,
            playersList,
            username,
            gameId,
            setCurrentStage,
            addPlayer,
            setUsername,
            setGameId,
        }}>
            {children}
        </GameContext.Provider>
    )
}

export function useGameContext(){ return useContext(GameContext); }