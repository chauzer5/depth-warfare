"use client";

import { createContext, useContext, useState, useReducer } from "react";
import { maps } from "../maps";
import {
  columnToIndex,
  rowToIndex,
  ENGINEER_SYSTEMS_INFO,
  getRightAngleUnitVector,
  SYSTEMS_INFO,
  getCellSector,
  keepLastNElements,
  capitalizeFirstLetter,
} from "../utils";

const GameContext = createContext();

export function GameWrapper({ children }) {
  const islandList = maps[process.env.ISLAND_MAP];
  const [username, setUsername] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [hostClientId, setHostClientId] = useState(null);
  const [gameId, setGameId] = useState();
  const [playerTeam, setPlayerTeam] = useState();
  const [playerRole, setPlayerRole] = useState();
  const [playerData, setPlayerData] = useState();
  


  // NEW CODE
  const initialNetworkState = {
    currentStage: "login",
    gameMap: null,
    repairMatrix: { blue: [], red: [] },
    subLocations: { blue: null, red: null },
    randomEnabledDirection: { blue: null, red: null },
    engineerPendingBlock: { blue: null, red: null },
    engineerHealSystem: { blue: false, red: false },
    minesList: { blue: [], red: [] },
    pendingNavigate: { blue: null, red: null },
    pendingSystemCharge: { blue: null, red: null },
    currentlySurfacing: { blue: false, red: false },
    systemChargeLevels: {
      blue: { mine: 0, torpedo: 0, probe: 0, boost: 0 },
      red: { mine: 0, torpedo: 0, probe: 0, boost: 0 },
    },
    systemHealthLevels: {
      blue: {
        weapons: process.env.MAX_SYSTEM_HEALTH,
        probe: process.env.MAX_SYSTEM_HEALTH,
        engine: process.env.MAX_SYSTEM_HEALTH,
        comms: process.env.MAX_SYSTEM_HEALTH,
        "life support": process.env.STARTING_LIFE_SUPPORT,
      },
      red: {
        weapons: process.env.MAX_SYSTEM_HEALTH,
        probe: process.env.MAX_SYSTEM_HEALTH,
        engine: process.env.MAX_SYSTEM_HEALTH,
        comms: process.env.MAX_SYSTEM_HEALTH,
        "life support": process.env.STARTING_LIFE_SUPPORT,
      },
    },
    radioMapNotes: { blue: [], red: [] },
    probes: { blue: [], red: [] },
    movements: { blue: [], red: [] },
    movementCountOnDisable: { blue: 0, red: 0 },
    engineerCompassMap: {
      blue: { north: "probe", south: "comms", east: "weapons", west: "engine" },
      red: { north: "probe", south: "comms", east: "weapons", west: "engine" },
    },
    notificationMessages: [],
    messageTimestamp: 0,
    gameStats: {
      blue: {
        // spacesTraveled: 0,
        timesBoosted: 0,
        minesDropped: 0,
        minesDetonated: 0,
        torpedoesLaunched: 0,
        timesSurfaced: 0,
        // systemsDisabled: 0,
      },
      red: {
        // spacesTraveled: 0,
        timesBoosted: 0,
        minesDropped: 0,
        minesDetonated: 0,
        torpedoesLaunched: 0,
        timesSurfaced: 0,
        // systemsDisabled: 0,
      }
    }
  };

  // Reducer
  function networkStateReducer(state, action) {
    const { type, value } = action;
    return {
      ...state,
      [type]: value,
    };
  }

  const [networkState, setNetworkState] = useReducer(
    networkStateReducer,
    initialNetworkState,
  );

  const getFirstMateSystem = (inputSystem) => {
    return SYSTEMS_INFO.find((system) => system.name === inputSystem);
  };

  //function to see which direction is disabled
  function isNavigationDisabled(direction, team, gameMap, subLocations) {
    switch (direction) {
      case "north":
        if (subLocations[team][0] === 0) {
          return true;
        } else if (
          gameMap[subLocations[team][0] - 1][subLocations[team][1]].type ===
          "island"
        ) {
          return true;
        } else if (
          gameMap[subLocations[team][0] - 1][subLocations[team][1]].visited[
            team
          ]
        ) {
          return true;
        }
        break;
      case "south":
        if (subLocations[team][0] === process.env.MAP_DIMENSION - 1) {
          return true;
        } else if (
          gameMap[subLocations[team][0] + 1][subLocations[team][1]].type ===
          "island"
        ) {
          return true;
        } else if (
          gameMap[subLocations[team][0] + 1][subLocations[team][1]].visited[
            team
          ]
        ) {
          return true;
        }
        break;
      case "west":
        if (subLocations[team][1] === 0) {
          return true;
        } else if (
          gameMap[subLocations[team][0]][subLocations[team][1] - 1].type ===
          "island"
        ) {
          return true;
        } else if (
          gameMap[subLocations[team][0]][subLocations[team][1] - 1].visited[
            team
          ]
        ) {
          return true;
        }
        break;
      case "east":
        if (subLocations[team][1] === process.env.MAP_DIMENSION - 1) {
          return true;
        } else if (
          gameMap[subLocations[team][0]][subLocations[team][1] + 1].type ===
          "island"
        ) {
          return true;
        } else if (
          gameMap[subLocations[team][0]][subLocations[team][1] + 1].visited[
            team
          ]
        ) {
          return true;
        }
        break;
      default:
        console.error(`Unrecognized direction: ${direction}`);
        return false;
    }

    return false;
  }

  function detonateWeapon(
    listToDetonate,
    listToUpdate,
    updatedDamageMap,
    damage,
    multiplier = 100,
  ) {
    let allHitCells = [];

    for (let i = 0; i < listToDetonate.length; i++) {
      const detonationCell = listToDetonate[i];

      // Remove mine that is detonating, this will be empty if a torpedo
      listToUpdate = listToUpdate.filter((item) => {
        return item[0] !== detonationCell[0] || item[1] !== detonationCell[1];
      });

      // Get the hit cells for the mine
      const hitCells = getCellsDistanceAway(
        detonationCell[0],
        detonationCell[1],
        damage - 1,
        false,
      );

      // Update all of the hits
      allHitCells = [...allHitCells, ...hitCells];

      // Then create a damage map hit
      const damageMap = hitCells.reduce((result, [row, col]) => {
        const tempDamage =
          Math.round((damage - manhattanDistance(row, col, detonationCell[0], detonationCell[1])) * multiplier * .25);
        result[`${row}-${col}`] = tempDamage;
        return result;
      }, {});

      // Update the overall damage map. This accumulates the damage values.
      for (const key in damageMap) {
        if (updatedDamageMap.hasOwnProperty(key)) {
          updatedDamageMap[key] += damageMap[key]; // Accumulate damage values
        } else {
          updatedDamageMap[key] = damageMap[key];
        }
      }
    }

    return {
      allHitCells: allHitCells,
      listToUpdate: listToUpdate,
      updatedDamageMap: updatedDamageMap,
    };
  }

  function rotateEngineerCompassValues(compassMap) {
    // Move to engineer only

    let rotatedMap = { ...compassMap };
    rotatedMap["north"] = compassMap["west"];
    rotatedMap["east"] = compassMap["north"];
    rotatedMap["south"] = compassMap["east"];
    rotatedMap["west"] = compassMap["south"];
    return rotatedMap;
  }

  function getMessagePlayer(message) {
    const messageSender = playerData?.find(
      (player) => player.clientId === message.clientId,
    );
    return messageSender;
  }

  function moveSub(team, row, column) {
    const { gameMap, subLocations, currentStage } = networkState;
    const mapCopy = [...gameMap];

    //Enforcing the sub movements
    if (
      row === -1 ||
      row === process.env.MAP_DIMENSION + 1 ||
      column === -1 ||
      column === process.env.MAP_DIMENSION + 1 ||
      mapCopy[row][column].type === "island" ||
      mapCopy[row][column].visited[team]
    ) {
      return {
        subLocations: subLocations,
        gameMap: mapCopy,
      };
    }

    // remove the old position and make the path visited
    if (subLocations[team]) {
      const prevContents =
        gameMap[subLocations[team][0]][subLocations[team][1]];
      const newContents = {
        ...prevContents,
        subPresent: {
          ...prevContents.subPresent,
          [team]: false,
        },
        visited: {
          ...prevContents.visited,
          [team]: currentStage === "main" ? true : false,
        },
      };

      // Mark the entire path as visited
      if (currentStage === "main") {
        const oldLocation = [subLocations[team][0], subLocations[team][1]];
        const newLocation = [row, column];
        const movementVector = [
          newLocation[0] - oldLocation[0],
          newLocation[1] - oldLocation[1],
        ];
        const distance =
          movementVector[0] !== 0
            ? Math.abs(movementVector[0])
            : Math.abs(movementVector[1]);
        const unitVector = getRightAngleUnitVector(movementVector);

        for (let i = 1; i < distance; i++) {
          const visitedRow = oldLocation[0] + unitVector[0] * i;
          const visitedColumn = oldLocation[1] + unitVector[1] * i;
          const visitedContents = gameMap[visitedRow][visitedColumn];
          const newVisitedContents = {
            ...visitedContents,
            visited: {
              ...visitedContents.visited,
              [team]: true,
            },
          };
          mapCopy[visitedRow][visitedColumn] = newVisitedContents;
        }
      }

      mapCopy[subLocations[team][0]][subLocations[team][1]] = newContents;
    }

    // add the new position
    const prevContents = gameMap[row][column];
    const newContents = {
      ...prevContents,
      subPresent: { ...prevContents.subPresent, [team]: true },
    };
    mapCopy[row][column] = newContents;

    return {
      subLocations: { ...subLocations, [team]: [row, column] },
      gameMap: mapCopy,
    };
  }

  function calculateNodeDistance(row1, col1, row2, col2, matrixLength) {
    let realRowIndices = [];
    let realColumnIndices = [];
    const rowIndices = [row1, row2];
    const columnIndices = [col1, col2];

    rowIndices.forEach((rowIndex, i) => {
      const row = rowIndices[i];
      const col = columnIndices[i];
      let realRow = row;
      let realCol = col;
      if (row === 0) {
        realRow += 1;
      }
      if (col === 0) {
        realCol += 1;
      }
      if (row === matrixLength - 1) {
        realRow -= 1;
      }
      if (col === matrixLength - 1) {
        realCol -= 1;
      }
      realRowIndices.push(realRow);
      realColumnIndices.push(realCol);
    });

    return (
      manhattanDistance(
        realRowIndices[0],
        realColumnIndices[0],
        realRowIndices[1],
        realColumnIndices[1],
      ) + 1
    );
  }

  function calculateMaxSystemHealth(matrix, system) {
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

    const dist = calculateNodeDistance(
      rowIndices[0],
      columnIndices[0],
      rowIndices[1],
      columnIndices[1],
      matrix.length,
    );

    return dist;
  }

  function calculateSystemNodeDistance(system) {
    const rowIndices = [];
    const columnIndices = [];

    const { repairMatrix } = networkState;

    for (let row = 0; row < repairMatrix[playerTeam].length; row++) {
      for (let col = 0; col < repairMatrix[playerTeam][0].length; col++) {
        const cell = repairMatrix[playerTeam][row][col];
        if (cell.type === "outer" && cell.system === system) {
          rowIndices.push(row);
          columnIndices.push(col);
        }
      }
    }

    return calculateNodeDistance(
      rowIndices[0],
      columnIndices[0],
      rowIndices[1],
      columnIndices[1],
      repairMatrix[playerTeam].length,
    );
  }

  function finishTurn(engineerBlockCell, chargedSystem, team) {
    const tempMessages = [];
    const {
      messageTimestamp,
      systemChargeLevels,
      engineerCompassMap,
      systemHealthLevels,
      repairMatrix,
      notificationMessages,
      movementCountOnDisable,
      randomEnabledDirection,
      pendingNavigate,
      engineerPendingBlock,
      movements,
      pendingSystemCharge,
      engineerHealSystem,
      gameStats,
    } = networkState;
    let tempMessageTimestamp = messageTimestamp;

    // charge the specified system
    const syncStateMessage = {
      systemChargeLevels: {
        ...systemChargeLevels,
        [team]: {
          ...systemChargeLevels[team],
          [chargedSystem]: systemChargeLevels[team][chargedSystem] + 1,
        },
      },
    };

    // place the pending matrix block and create an updated version of the repair matrix
    const blockSystem = engineerCompassMap[team][pendingNavigate[team]];

    // Filter out invalid systems, then damage a random system
    const filteredSystems = Object.keys(systemHealthLevels[team]).filter(
      (system) =>
        systemHealthLevels[team][system] > 0 && system !== "life support",
    );

    let randomSystem = blockSystem;

    if (filteredSystems.length > 0) {
      // Generate a random index within the valid range of filtered systems
      const randomIndex = Math.floor(Math.random() * filteredSystems.length);
      // Use the random index to select a system from the filtered list
      randomSystem = filteredSystems[randomIndex];
    }

    // Update the repair matrix and check to see if it is repaired
    const updatedMatrix = [...repairMatrix[team].map((row) => [...row])];

    const systemHealthDivider = calculateMaxSystemHealth(updatedMatrix, randomSystem)
    // set the updated health level for the system
    const updatedHealthLevel = Math.max(
      systemHealthLevels[team][randomSystem] - Math.ceil(100 / systemHealthDivider) , // process.env.SYSTEM_DAMAGE_AMOUNT,
      0,
    );

    // Damage the system corresponding to the block placed
    syncStateMessage["systemHealthLevels"] = {
      ...systemHealthLevels,
      [team]: {
        ...systemHealthLevels[team],
        [randomSystem]: updatedHealthLevel,
      },
    };

    const { row, column } = engineerBlockCell;

    updatedMatrix[row][column] = {
      ...updatedMatrix[row][column],
      system: blockSystem,
    };

    const { isConnected } = checkConnectedRepairMatrixPath(
      updatedMatrix,
      blockSystem,
    );

    if (isConnected) {
      updatedMatrix.forEach((row) => {
        row.forEach((cell) => {
          if (cell.system === blockSystem) {
            cell.system = "empty";
          }
        });
      });

      // Choose new random nodes along the outside
      const selectedCells = pickNewOuterCells(updatedMatrix);

      for (const { row, col } of selectedCells) {
        updatedMatrix[row][col] = {
          type: "outer",
          system: blockSystem,
        };
      }

      const notificationMessage = {
        team,
        sameTeamMessage: `${capitalizeFirstLetter(blockSystem)} repaired`,
        oppTeamMessage: null,
        intendedPlayer: "all", // You can specify a player here if needed
        severitySameTeam: "success",
        severityOppTeam: null,
        timestamp: tempMessageTimestamp,
      };

      tempMessages.push(notificationMessage);
      tempMessageTimestamp += 1;

      syncStateMessage["systemHealthLevels"][team][blockSystem] = process.env.MAX_SYSTEM_HEALTH
        // calculateMaxSystemHealth(updatedMatrix, blockSystem);
    }

    // move the sub in the specified direction
    const moveSubInfo = moveSubDirection(team, pendingNavigate[team]);

    syncStateMessage["subLocations"] = moveSubInfo.subLocations;
    syncStateMessage["gameMap"] = moveSubInfo.gameMap;

    let newSystemDisabled = false;
    if (
      syncStateMessage["systemHealthLevels"][team][randomSystem] === 0 &&
      systemHealthLevels[team][randomSystem] > 0
    ) {
      // Notify team that system is now disabled
      newSystemDisabled = true;
      const notificationMessage = {
        team,
        sameTeamMessage: `${capitalizeFirstLetter(randomSystem)} disabled`,
        oppTeamMessage: null,
        intendedPlayer: "all", // You can specify a player here if needed
        severitySameTeam: "error",
        severityOppTeam: null,
        timestamp: tempMessageTimestamp,
      };
      tempMessages.push(notificationMessage);
      tempMessageTimestamp += 1;

      // If the system is comms, keep track of how many enemy movements were before it was disabled
      if (randomSystem === "comms") {
        const oppositeTeam = team === "blue" ? "red" : "blue";
        syncStateMessage["movementCountOnDisable"] = {
          ...movementCountOnDisable,
          [oppositeTeam]: movements[oppositeTeam].length,
        };
      }
    }

    const directions = ["north", "south", "west", "east"];
    const disabledDirectionStates = {};

    directions.forEach((direction) => {
      disabledDirectionStates[direction] = isNavigationDisabled(
        direction,
        team,
        moveSubInfo.gameMap,
        moveSubInfo.subLocations,
      );
    });

    const trueDirections = Object.keys(disabledDirectionStates).filter(
      (direction) => disabledDirectionStates[direction] === false,
    );

    const randomIndex = Math.floor(Math.random() * trueDirections.length);

    syncStateMessage["randomEnabledDirection"] = {
      ...randomEnabledDirection,
      [team]: trueDirections[randomIndex],
    };

    // Update the state with the new matrix containing reset cells
    const rotatedValues = rotateEngineerCompassValues(engineerCompassMap[team]);

    const updatedTeamMap = {
      ...engineerCompassMap,
      [team]: {
        ...rotatedValues,
      },
    };

    syncStateMessage["repairMatrix"] = {
      ...repairMatrix,
      [team]: updatedMatrix,
    };

    syncStateMessage["engineerCompassMap"] = updatedTeamMap;

    syncStateMessage["movements"] = {
      ...movements,
      [team]: [...movements[team], pendingNavigate[team]],
    };
    syncStateMessage["pendingSystemCharge"] = {
      ...pendingSystemCharge,
      [team]: null,
    };
    syncStateMessage["engineerPendingBlock"] = {
      ...engineerPendingBlock,
      [team]: null,
    };
    syncStateMessage["pendingNavigate"] = { ...pendingNavigate, [team]: null };
    syncStateMessage["engineerHealSystem"] = {
      ...engineerHealSystem,
      [team]: false,
    };
    syncStateMessage["notificationMessages"] = keepLastNElements(
      [...notificationMessages, ...tempMessages],
      process.env.MAX_MESSAGES,
    );
    syncStateMessage["messageTimestamp"] = tempMessageTimestamp;
    // syncStateMessage["gameStats"] = {
    //   ...gameStats,
    //   [team]: {
    //     ...gameStats[team],
    //     spacesTraveled: gameStats[team].spacesTraveled + 1,
    //     systemsDisabled: newSystemDisabled ? gameStats[team].systemsDisabled + 1 : gameStats[team].systemsDisabled,
    //   }
    // }

    // sync state across the clients
    return syncStateMessage;
  }

  function moveSubDirection(team, direction) {
    const { subLocations } = networkState;
    const [row, column] = subLocations[team];
    let moveInfo = {};
    switch (direction) {
      case "north":
        moveInfo = moveSub(team, row - 1, column);
        break;
      case "south":
        moveInfo = moveSub(team, row + 1, column);
        break;
      case "west":
        moveInfo = moveSub(team, row, column - 1);
        break;
      case "east":
        moveInfo = moveSub(team, row, column + 1);
        break;
      default:
        console.error(`Unrecognized direction: ${direction}`);
    }
    return moveInfo;
  }

  function resetMap() {
    let blankGameMap = Array(process.env.MAP_DIMENSION);
    for (let i = 0; i < process.env.MAP_DIMENSION; i++) {
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
      blankGameMap[rowToIndex(spot[1])][columnToIndex(spot[0])] = {
        type: "island",
      };
    });

    return blankGameMap; // setGameMap(blankGameMap);
  }

  function clearVisitedPath(team) {
    const { gameMap } = networkState;
    const mapCopy = [...gameMap];

    for (let row = 0; row < process.env.MAP_DIMENSION; row++) {
      for (let col = 0; col < process.env.MAP_DIMENSION; col++) {
        const prevContents = gameMap[row][col];
        const newContents = {
          ...prevContents,
          visited: {
            ...prevContents.visited,
            [team]: false,
          },
        };
        mapCopy[row][col] = newContents;
      }
    }

    return mapCopy;
  }

  const isCornerRepairMatrix = (row, column, matrix) => {
    return (
      (row === 0 && column === 0) ||
      (row === 0 && column === matrix.length - 1) ||
      (row === matrix.length - 1 && column === 0) ||
      (row === matrix.length - 1 && column === matrix.length - 1)
    );
  };

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

  const pickNewOuterCells = (matrix) => {
    const emptyOuterCells = []; // Array to store coordinates of empty outer cells

    // Find empty outer cells and store their coordinates
    for (let row = 0; row < matrix.length; row++) {
      for (let col = 0; col < matrix[0].length; col++) {
        const cell = matrix[row][col];
        if (
          cell.type === "outer" &&
          cell.system === "empty" &&
          !isCornerRepairMatrix(row, col, matrix)
        ) {
          emptyOuterCells.push({ row, col });
        }
      }
    }

    // Check if there are at least two empty outer cells
    if (emptyOuterCells.length < 2) {
      return;
    }

    // Randomly select two empty outer cells
    let randomIndices;
    let selectedCells;
    let nodeDist;
    for (let i = 0; i < 10000; i++) {
      randomIndices = getRandomIndices(emptyOuterCells.length, 2);
      selectedCells = randomIndices.map((index) => emptyOuterCells[index]);
      nodeDist = calculateNodeDistance(
        selectedCells[0].row,
        selectedCells[0].col,
        selectedCells[1].row,
        selectedCells[1].col,
        matrix.length,
      );
      if (
        nodeDist <= process.env.MAX_NODE_DISTANCE &&
        nodeDist >= process.env.MIN_NODE_DISTANCE
      ) {
        break;
      }
    }

    return selectedCells;
  };

  function findConnectedRepairMatrixPath(
    matrix,
    startRow,
    startCol,
    targetRow,
    targetCol,
  ) {
    const visited = new Array(matrix.length)
      .fill(false)
      .map(() => new Array(matrix[0].length).fill(false));
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
        (matrix[row][col].type === "outer" && prevCellType === "outer")
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
  }

  function checkConnectedRepairMatrixPath(matrix, system) {
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

      return findConnectedRepairMatrixPath(
        matrix,
        startRow,
        startCol,
        targetRow,
        targetCol,
      );
    } else {
      return { isConnected: false, pathRowIndices: [], pathColumnIndices: [] };
    }
  }

  function getEmptyRepairMatrix() {
    const dimension = process.env.REPAIR_MATRIX_DIMENSION;

    // const doubledSystems = systems.concat(systems.slice());
    // const extra_elements = dimension * 4;

    // while (doubledSystems.length < extra_elements) {
    //   doubledSystems.push("empty");
    // }

    let blankRepairMatrix = [];

    for (let i = 0; i < dimension + 2; i++) {
      let row = [];
      for (let j = 0; j < dimension + 2; j++) {
        if (i === 0 || i === dimension + 1 || j === 0 || j === dimension + 1) {
          // Cells in the first row, last row, first column, and last column are "outer" cells
          row.push({
            type: "outer",
            system: "empty",
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

    const systems = ENGINEER_SYSTEMS_INFO.filter(
      (system) => system.name !== "life support",
    ).map((system) => system.name);

    const shuffledSystems = shuffleArray(systems);

    let selectedCells;
    shuffledSystems.forEach((system, i) => {
      // Choose new random nodes along the outside
      selectedCells = pickNewOuterCells(blankRepairMatrix);

      for (const { row, col } of selectedCells) {
        blankRepairMatrix[row][col] = {
          type: "outer",
          system: system,
        };
      }
    });

    return blankRepairMatrix;
  }

  // Function to shuffle an array using Fisher-Yates algorithm
  function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  function getValidBoostCells(team, subLocations, gameMap) {
    const [row, column] = subLocations[team];
    const validCells = [];

    // Check 4 cells in the north direction
    for (let i = 1; i <= 4; i++) {
      if (row - i < 0) {
        break;
      }
      if (gameMap[row - i][column].type === "island") {
        break;
      }
      if (gameMap[row - i][column].visited[team]) {
        break;
      }

      validCells.push([row - i, column]);
    }

    // Check 4 cells in the east direction
    for (let i = 1; i <= 4; i++) {
      if (column + i >= process.env.MAP_DIMENSION) {
        break;
      }
      if (gameMap[row][column + i].type === "island") {
        break;
      }
      if (gameMap[row][column + i].visited[team]) {
        break;
      }

      validCells.push([row, column + i]);
    }

    // Check 4 cells in the south direction
    for (let i = 1; i <= 4; i++) {
      if (row + i >= process.env.MAP_DIMENSION) {
        break;
      }
      if (gameMap[row + i][column].type === "island") {
        break;
      }
      if (gameMap[row + i][column].visited[team]) {
        break;
      }

      validCells.push([row + i, column]);
    }

    // Check 4 cells in the west direction
    for (let i = 1; i <= 4; i++) {
      if (column - i < 0) {
        break;
      }
      if (gameMap[row][column - i].type === "island") {
        break;
      }
      if (gameMap[row][column - i].visited[team]) {
        break;
      }

      validCells.push([row, column - i]);
    }

    return validCells;
  }

  function explorePaths(
    row,
    col,
    distance,
    visited,
    validCells,
    avoidIslands,
    currentDistance = 0,
  ) {
    const { gameMap } = networkState;
    if (
      row < 0 ||
      col < 0 ||
      row >= gameMap.length ||
      col >= gameMap[0].length ||
      currentDistance > distance ||
      visited[row][col] ||
      (avoidIslands && gameMap[row][col].type === "island")
    ) {
      // visited[row][col] = true;
      return;
    }

    visited[row][col] = true;
    validCells.push([row, col]);

    // Explore neighboring cells
    explorePaths(
      row + 1,
      col,
      distance,
      visited,
      validCells,
      avoidIslands,
      currentDistance + 1,
    ); // Down
    explorePaths(
      row - 1,
      col,
      distance,
      visited,
      validCells,
      avoidIslands,
      currentDistance + 1,
    ); // Up
    explorePaths(
      row,
      col + 1,
      distance,
      visited,
      validCells,
      avoidIslands,
      currentDistance + 1,
    ); // Right
    explorePaths(
      row,
      col - 1,
      distance,
      visited,
      validCells,
      avoidIslands,
      currentDistance + 1,
    ); // Left

    visited[row][col] = false;
  }

  function getCellsDistanceAway(
    startRow,
    startCol,
    maxDistance,
    removeStart = true,
    avoidIslands = true,
  ) {
    const { gameMap } = networkState;
    const rows = gameMap.length;
    const cols = gameMap[0].length;

    // Create a visited array to keep track of visited cells
    const visited = new Array(rows)
      .fill(false)
      .map(() => new Array(cols).fill(false));

    const validCells = [];
    explorePaths(startRow, startCol, maxDistance, visited, validCells, avoidIslands);

    // Find the index of the starting cell in validCells and remove it
    if (removeStart) {
      const startingCellIndex = validCells.findIndex(
        ([row, col]) => row === startRow && col === startCol,
      );
      if (startingCellIndex !== -1) {
        validCells.splice(startingCellIndex, 1);
      }
    }
    return validCells;
  }

  function healSystem(team, system) {
    const { systemHealthLevels, repairMatrix } = networkState;
    setNetworkState({
      key: "systemHealthLevels",
      value: {
        ...systemHealthLevels,
        [team]: {
          ...systemHealthLevels[team],
          [system]: process.env.MAX_SYSTEM_HEALTH // calculateMaxSystemHealth(repairMatrix[team], system),
        },
      },
    });
  }

  function manhattanDistance(row1, col1, row2, col2) {
    return Math.abs(row1 - row2) + Math.abs(col1 - col2);
  }

  function updateLifeSupport(team, damage) {
    const { systemHealthLevels } = networkState;
    return Math.max(systemHealthLevels[team]["life support"] - damage, 0);
  }

  function scanForEnemySub(row, column, scanType, subLocations) {
    const enemySubLocations =
      subLocations[playerTeam === "blue" ? "red" : "blue"];
    const enemySubRow = enemySubLocations[0];
    const enemySubColumn = enemySubLocations[1];

    switch (scanType) {
      case "sector":
        return (
          getCellSector([row, column]) ===
          getCellSector([enemySubRow, enemySubColumn])
        );
      case "row":
        return row === enemySubRow;
      case "column":
        return column === enemySubColumn;
      default:
        console.error(`Unrecognized scan type: ${scanType}`);
    }
  }

  return (
    <GameContext.Provider
      value={{
        username,
        roomCode,
        gameId,
        playerTeam,
        playerRole,
        islandList,
        hostClientId,
        playerData,
        calculateMaxSystemHealth,
        clearVisitedPath,
        pickNewOuterCells,
        getValidBoostCells,
        isNavigationDisabled,
        setUsername,
        setRoomCode,
        setGameId,
        setPlayerTeam,
        setPlayerRole,
        moveSub,
        moveSubDirection,
        setPlayerData,
        getMessagePlayer,
        resetMap,
        getEmptyRepairMatrix,
        getCellsDistanceAway,
        checkConnectedRepairMatrixPath,
        healSystem,
        rotateEngineerCompassValues,
        getFirstMateSystem,
        updateLifeSupport,
        manhattanDistance,
        scanForEnemySub,
        detonateWeapon,
        finishTurn,
        setHostClientId,
        calculateSystemNodeDistance,
        networkState,
        setNetworkState,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGameContext() {
  return useContext(GameContext);
}
