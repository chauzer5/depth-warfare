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
            weapons: process.env.MAX_SYSTEM_HEALTH,
            scan: process.env.MAX_SYSTEM_HEALTH,
            engine: process.env.MAX_SYSTEM_HEALTH,
            comms: process.env.MAX_SYSTEM_HEALTH,
            "life support": process.env.MAX_SYSTEM_HEALTH,
        },
        red: {
            weapons: process.env.MAX_SYSTEM_HEALTH,
            scan: process.env.MAX_SYSTEM_HEALTH,
            engine: process.env.MAX_SYSTEM_HEALTH,
            comms: process.env.MAX_SYSTEM_HEALTH,
            "life support": process.env.MAX_SYSTEM_HEALTH,
        }
    });
    const [radioMapNotes, setRadioMapNotes] = useState([]);
    const [enemyMovements, setEnemyMovements] = useState([]);
    const [pendingRepairMatrixBlock, setPendingRepairMatrixBlock] = useState({ blue: null, red: null });
    const [engineerCompassMap, setEngineerCompassMap] = useState({
        blue: {
            "north": "scan",
            "south": "comms",
            "east": "weapons",
            "west": "engine",
        },
        red: {
            "north": "scan",
            "south": "comms",
            "east": "weapons",
            "west": "engine",
        }
    });

    function rotateEngineerCompassValues(compassMap) {
        const rotatedMap = { ...compassMap };
        for (const color in rotatedMap) {
            const values = Object.values(rotatedMap[color]);
            const rotatedValues = [values[values.length - 1], ...values.slice(0, values.length - 1)];
            Object.keys(rotatedMap[color]).forEach((direction, index) => {
                rotatedMap[color][direction] = rotatedValues[index];
            });
        }
        return rotatedMap;
    }

    function getMessagePlayer(message){
        const messageSender = playerData.find((player) => player.clientId === message.clientId);
        return messageSender;
    };

    function moveSub(team, row, column){
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

    function moveSubDirection(team, direction){
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

    function resetMap(){
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

    const isCornerRepairMatrix = (row, column) => {
        return (row === 0 && column === 0 
            || row === 0 && column === repairMatrix.length - 1
            || row === repairMatrix.length - 1 && column === 0
            || row === repairMatrix.length - 1 && column === repairMatrix.length - 1)
    }

    // Function to get random distinct indices
    const getRandomIndices = (max, count) => {
        const indices = Array.from({ length: max }, (_, index) => index);
        const randomIndices = [];
    
        while (randomIndices.length < count && indices.length > 0) {
            const randomIndex = Math.floor(Math.random() * indices.length);
            randomIndices.push(indices.splice(randomIndex, 1)[0]);
        }
    
        return randomIndices;
    };

    const pickNewOuterCells = () => {
        const emptyOuterCells = []; // Array to store coordinates of empty outer cells
    
        // Find empty outer cells and store their coordinates
        for (let row = 0; row < repairMatrix.length; row++) {
            for (let col = 0; col < repairMatrix[0].length; col++) {
                const cell = repairMatrix[row][col];
                if (cell.type === "outer" && cell.system === "empty" && !isCornerRepairMatrix(row, col)) {
                    emptyOuterCells.push({ row, col });
                }
            }
        }
    
        // Check if there are at least two empty outer cells
        if (emptyOuterCells.length < 2) {
            console.log("Not enough empty outer cells to assign current_system.");
            return;
        }
    
        // Randomly select two empty outer cells
        const randomIndices = getRandomIndices(emptyOuterCells.length, 2);
        const selectedCells = randomIndices.map(index => emptyOuterCells[index]);

        return selectedCells
    };

    function findConnectedRepairMatrixPath(matrix, startRow, startCol, targetRow, targetCol){
        const visited = new Array(matrix.length).fill(false).map(() => new Array(matrix[0].length).fill(false));
        const systemName = matrix[startRow][startCol].system;
    
        const pathRowIndices = [];
        const pathColumnIndices = [];
        let prevCellType;
    
        const hasPath = (row, col, prevCellType) => {
            if (
                row < 0 ||
                row >= matrix.length ||
                col < 0 ||
                col >= matrix[0].length ||
                visited[row][col] ||
                matrix[row][col].system !== systemName ||
                matrix[row][col].type === "outer" && prevCellType === "outer"
            ) {
                return false;
            }
    
            visited[row][col] = true;
            pathRowIndices.push(row);
            pathColumnIndices.push(col);
            prevCellType = matrix[row][col].type;
    
            if (row === targetRow && col === targetCol) {
                return true;
            }
    
            const neighbors = [
                [row - 1, col],
                [row + 1, col],
                [row, col - 1],
                [row, col + 1],
            ];
    
            for (const [nRow, nCol] of neighbors) {
                if (hasPath(nRow, nCol, prevCellType)) {
                    return true;
                }
            }
    
            pathRowIndices.pop();
            pathColumnIndices.pop();
            return false;
        };
    
        const isConnected = hasPath(startRow, startCol, null);
    
        if (!isConnected) {
            pathRowIndices.length = 0;
            pathColumnIndices.length = 0;
        }
    
        return { isConnected, pathRowIndices, pathColumnIndices };
    };

    function checkConnectedRepairMatrixPath(matrix, system){
        const rowIndices = [];
        const columnIndices = [];
    
        for (let row = 0; row < matrix.length; row++) {
            for (let col = 0; col < matrix[0].length; col++) {
                const cell = matrix[row][col];
                if (cell.type === "outer" && cell.system === system) {
                    rowIndices.push(row);
                    columnIndices.push(col);
                }
            }
        }
    
        if (rowIndices.length >= 2) {
            const startRow = rowIndices[0];
            const startCol = columnIndices[0];
            const targetRow = rowIndices[1];
            const targetCol = columnIndices[1];
    
            return findConnectedRepairMatrixPath(matrix, startRow, startCol, targetRow, targetCol);
        } else {
            return { isConnected: false, pathRowIndices: [], pathColumnIndices: [] };
        }
    }

    function resetRepairMatrix(){
        const dimension = process.env.REPAIR_MATRIX_DIMENSION;
        const systems = ENGINEER_SYSTEMS_INFO.filter(system => system.name !== "life support").map(system => system.name);
        const doubledSystems = systems.concat(systems.slice());
        const extra_elements = dimension * 4

        while (doubledSystems.length < extra_elements) {
            doubledSystems.push("empty");
        }

        const shuffledSystems = shuffleArray(doubledSystems).sort();
    
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

    function getValidSilenceCells(){
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

    function healSystem(team, system){
        console.log(systemHealthLevels[team], system, "before")
        setSystemHealthLevels({
            ...systemHealthLevels,
            [team]: {
                ...systemHealthLevels[team],
                [system]: process.env.MAX_SYSTEM_HEALTH,
            },
        });
        console.log({
            ...systemHealthLevels,
            [team]: {
                ...systemHealthLevels[team],
                [system]: process.env.MAX_SYSTEM_HEALTH,
            },
        }[team], system, "after")
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
            repairMatrix,
            playerData,
            pendingNavigate,
            pendingSystemCharge,
            systemChargeLevels,
            systemHealthLevels,
            engineerCompassMap,
            radioMapNotes,
            enemyMovements,
            pickNewOuterCells,
            pendingRepairMatrixBlock,
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
            setRepairMatrix,
            moveSub,
            moveSubDirection,
            setPlayerData,
            getMessagePlayer,
            setPendingNavigate,
            setPendingSystemCharge,
            setSystemChargeLevels,
            setSystemHealthLevels,
            setEngineerCompassMap,
            resetMap,
            resetRepairMatrix,
            setRadioMapNotes,
            setEnemyMovements,
            checkConnectedRepairMatrixPath,
            setPendingRepairMatrixBlock,
            healSystem,
            rotateEngineerCompassValues,
        }}>
            {children}
        </GameContext.Provider>
    )
}

export function useGameContext(){ return useContext(GameContext); }