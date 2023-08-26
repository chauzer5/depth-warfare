import { ENGINEER_SYSTEMS_MAP } from "../utils";

// This function lets the captain pick a starting point
// MESSAGE: {row, column}
export function captainSetStartingSpot(context, message) {
    const {
        moveSub,
        getMessagePlayer,
        subLocations,
        setCurrentStage,
    } = context;

    const team = getMessagePlayer(message).team;

    let allDone = false;
    moveSub(team, message.data.row, message.data.column);
    if(subLocations[team === "blue" ? "red" : "blue"]){
      allDone = true;
    }

    if(allDone){
      setCurrentStage("countdown");
    }
}

// This is the one where the captain picks a direction to go, 
// This should trigger when the engineer and first mate can start their decisions
// MESSAGE: {direction}
export function captainStartSubNavigate(context, message) {
  const {
    pendingNavigate,
    setPendingNavigate,
    getMessagePlayer,
  } = context;

  const team = getMessagePlayer(message).team;

  setPendingNavigate({ ...pendingNavigate, [team]: message.data.direction });
}

//engineer picks the systems to activate, which will damage it each turn
// MESSAGE: {row, column}
export function engineerPlaceSystemBlock(context, message){
  const {
    pendingNavigate,
    setPendingNavigate,
    pendingRepairMatrixBlock,
    setPendingRepairMatrixBlock,
    systemChargeLevels,
    setSystemChargeLevels,
    pendingSystemCharge,
    getMessagePlayer,
    checkConnectedRepairMatrixPath,
    moveSubDirection,
    setSystemHealthLevels,
    systemHealthLevels,
    enemyMovements,
    setEnemyMovements,
    playerTeam,
    healSystem,
    setPendingSystemCharge,
    setRepairMatrix,
    repairMatrix,
    pickNewOuterCells,
  } = context;

  const team = getMessagePlayer(message).team;

  if (!pendingSystemCharge[team]) {
    setPendingRepairMatrixBlock({ ...pendingRepairMatrixBlock, [team]: [message.data.row, message.data.column]});
  }
  else {
    // charge the pending system
    setSystemChargeLevels({
      ...systemChargeLevels,
      [team]: {
        ...systemChargeLevels[team],
        [pendingSystemCharge[team]]: systemChargeLevels[team][pendingSystemCharge[team]] + 1,
      },
    });

    // place the specified matrix block
    const blockSystem = ENGINEER_SYSTEMS_MAP[pendingNavigate[team]];

    const updatedMatrix = [...repairMatrix.map(row => [...row])];
    updatedMatrix[message.data.row][message.data.column] = {
      ...updatedMatrix[message.data.row][message.data.column],
      system: blockSystem,
    };

    // Damage the system corresponding to the block placed
    setSystemHealthLevels({
      ...systemHealthLevels,
      [team]: {
        ...systemHealthLevels[team],
        [blockSystem]: systemHealthLevels[team][blockSystem] - process.env.SYSTEM_DAMAGE_AMOUNT,
      },
    });

    // Check to see if two outer nodes have been connected
    const { isConnected, pathRowIndices, pathColumnIndices } = checkConnectedRepairMatrixPath(updatedMatrix, blockSystem);

    if (isConnected) {
      // heal the system
      healSystem(team, blockSystem);

      // Reset the cells along the path to "empty"
      for (let i = 0; i < pathRowIndices.length; i++) {
          const pathRow = pathRowIndices[i];
          const pathCol = pathColumnIndices[i];

          updatedMatrix[pathRow][pathCol] = {
              ...updatedMatrix[pathRow][pathCol],
              system: "empty",
          };
      }

      const selectedCells = pickNewOuterCells(updatedMatrix)

      for (const { row, col } of selectedCells) {
          updatedMatrix[row][col] = {
              type: "outer",
              system: blockSystem,
          };
      }
    }

    // Update the state with the new matrix containing reset cells
    setRepairMatrix(updatedMatrix);

    // move the sub in the specified direction
    moveSubDirection(team, pendingNavigate[team]);
    if(playerTeam !== team){
      setEnemyMovements([...enemyMovements, pendingNavigate[team]]);
    }

    // reset the pending state
    setPendingSystemCharge({ ...pendingSystemCharge, [team]: null });
    setPendingRepairMatrixBlock({ ...pendingRepairMatrixBlock, [team]: null });
    setPendingNavigate({ ...pendingNavigate, [team]: null });
  }
}

// first mate choses something to activate
// MESSAGE: {system}
export function firstMateChooseSystemCharge(context, message){
  const {
    pendingNavigate,
    setPendingNavigate,
    pendingRepairMatrixBlock,
    setPendingRepairMatrixBlock,
    systemChargeLevels,
    setSystemChargeLevels,
    pendingSystemCharge,
    getMessagePlayer,
    checkConnectedRepairMatrixPath,
    moveSubDirection,
    setSystemHealthLevels,
    systemHealthLevels,
    enemyMovements,
    setEnemyMovements,
    playerTeam,
    healSystem,
    setPendingSystemCharge,
    setRepairMatrix,
    repairMatrix,
    pickNewOuterCells,
  } = context;

  const team = getMessagePlayer(message).team;

  if (!pendingRepairMatrixBlock[team]) {
    setPendingSystemCharge({ ...pendingSystemCharge, [team]: message.data.system });
  }
  else {
    // charge the specified system
    setSystemChargeLevels({
      ...systemChargeLevels,
      [team]: {
        ...systemChargeLevels[team],
        [message.data.system]: systemChargeLevels[team][message.data.system] + 1,
      },
    });

    // // place the pending matrix block
    const blockSystem = ENGINEER_SYSTEMS_MAP[pendingNavigate[team]];

    // Damage the system corresponding to the block placed
    setSystemHealthLevels({
      ...systemHealthLevels,
      [team]: {
        ...systemHealthLevels[team],
        [blockSystem]: systemHealthLevels[team][blockSystem] - process.env.SYSTEM_DAMAGE_AMOUNT,
      },
    });

    const updatedMatrix = [...repairMatrix.map(row => [...row])];

    updatedMatrix[pendingRepairMatrixBlock[team][0]][pendingRepairMatrixBlock[team][1]] = {
      ...updatedMatrix[pendingRepairMatrixBlock[team][0]][pendingRepairMatrixBlock[team][1]],
      system: blockSystem,
    };

    // check to see if two outer nodes have been connected
    const { isConnected, pathRowIndices, pathColumnIndices } = checkConnectedRepairMatrixPath(updatedMatrix, blockSystem);

    if (isConnected) {
      // heal the system
      healSystem(team, blockSystem);

      // Reset the cells along the path to "empty"
      for (let i = 0; i < pathRowIndices.length; i++) {
          const pathRow = pathRowIndices[i];
          const pathCol = pathColumnIndices[i];

          updatedMatrix[pathRow][pathCol] = {
              ...updatedMatrix[pathRow][pathCol],
              system: "empty",
          };
      }

      // Choose new random nodes along the outside
      const selectedCells = pickNewOuterCells(updatedMatrix)

      for (const { row, col } of selectedCells) {
          updatedMatrix[row][col] = {
              type: "outer",
              system: blockSystem,
          };
      }
    }

    // Update the state with the new matrix containing reset cells
    setRepairMatrix(updatedMatrix);

    // move the sub in the specified direction
    moveSubDirection(team, pendingNavigate[team]);
    if(playerTeam !== team){
      setEnemyMovements([...enemyMovements, pendingNavigate[team]]);
    }

    // reset the pending state
    setPendingSystemCharge({ ...pendingSystemCharge, [team]: null });
    setPendingRepairMatrixBlock({ ...pendingRepairMatrixBlock, [team]: null });
    setPendingNavigate({ ...pendingNavigate, [team]: null });
  }
}

//Captain can change his mind on a move he makes
// MESSAGE: {}
export function captainCancelSubNavigate(context, message){
  const {
    pendingNavigate,
    setPendingNavigate,
    pendingRepairMatrixBlock,
    setPendingRepairMatrixBlock,
    pendingSystemCharge,
    setPendingSystemCharge,
    getMessagePlayer,
  } = context;

  const team = getMessagePlayer(message).team;

  setPendingNavigate({ ...pendingNavigate, [team]: null });
  setPendingRepairMatrixBlock({ ...pendingRepairMatrixBlock, [team]: null });
  setPendingSystemCharge({ ...pendingSystemCharge, [team]: null });
}

// Captain uses the silence ability
// MESSAGE: {row, column}
export function captainSilence(context, message){
  const {
    setSystemChargeLevels,
    systemChargeLevels,
    getMessagePlayer,
    moveSub,
    enemyMovements,
    setEnemyMovements,
    playerTeam,
  } = context;

  const team = getMessagePlayer(message).team;

  // Move the sub to the chosen location
  moveSub(team, message.data.row, message.data.column);

  // Reduce the charge level of the silence system to 0
  setSystemChargeLevels({
    ...systemChargeLevels,
    [team]: {
      ...systemChargeLevels[team],
      silence: 0,
    },
  });

  // Add "silence" to the enemy movements list
  if(playerTeam !== team){
    setEnemyMovements([...enemyMovements, "silence"]);
  }
}

// Captain triggers a "surface" event
// MESSAGE: {}
export function captainSurface(context, message){

}

// Engineer clears the systems
// MESSAGE: {}
export function engineerClearSystems(context, message){

}

// First mate fires a torpedo
// MESSAGE: {row, column}
export function firstMateFireTorpedo(context, message){

}

// First mate drops a mine
// MESSAGE: {row, column}
export function firstMateDropMine(context, message){
  
}

// First mate detonates a mine
// MESSAGE: {row, column}
export function firstMateDetonateMine(context, message){
  
}

// First mate scans a row, column, or sector
// MESSAGE: {row, column, scanType}
export function firstMateScan(context, message){
  
}
