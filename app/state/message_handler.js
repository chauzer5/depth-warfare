import { ENGINEER_SYSTEMS_INFO, getCellSector, getCellName } from "../utils";

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
    engineerCompassMap,
    setEngineerCompassMap,
    rotateEngineerCompassValues,
  } = context;

  const team = getMessagePlayer(message).team;

  if (!pendingSystemCharge[team]) {
    setPendingRepairMatrixBlock({ ...pendingRepairMatrixBlock, [team]: [message.data.row, message.data.column]});
  }
  else {
    const chargedSystem = pendingSystemCharge[team]
    // charge the specified system
    setSystemChargeLevels({
      ...systemChargeLevels,
      [team]: {
        ...systemChargeLevels[team],
        [chargedSystem]: systemChargeLevels[team][chargedSystem] + 1,
      },
    });

    // // place the pending matrix block
    const blockSystem = engineerCompassMap[team][pendingNavigate[team]];

    // Damage the system corresponding to the block placed
    setSystemHealthLevels({
      ...systemHealthLevels,
      [team]: {
        ...systemHealthLevels[team],
        [blockSystem]: Math.max(systemHealthLevels[team][blockSystem] - process.env.SYSTEM_DAMAGE_AMOUNT, 0),
      },
    });

    const updatedMatrix = [...repairMatrix[team].map(row => [...row])];

    updatedMatrix[message.data.row][message.data.column] = {
      ...updatedMatrix[message.data.row][message.data.column],
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
    setRepairMatrix({...repairMatrix, [team]: updatedMatrix});

    const rotatedValues = rotateEngineerCompassValues(engineerCompassMap[team]);

    console.log(rotatedValues)

    const updatedTeamMap = {
        ...engineerCompassMap,
        [team]: {
            ...rotatedValues,
        }
    };

    setEngineerCompassMap(updatedTeamMap);

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
    engineerCompassMap,
    setEngineerCompassMap,
    rotateEngineerCompassValues,
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
    const blockSystem = engineerCompassMap[team][pendingNavigate[team]];

    // Damage the system corresponding to the block placed
    setSystemHealthLevels({
      ...systemHealthLevels,
      [team]: {
        ...systemHealthLevels[team],
        [blockSystem]: Math.max(systemHealthLevels[team][blockSystem] - process.env.SYSTEM_DAMAGE_AMOUNT, 0),
      },
    });

    const updatedMatrix = [...repairMatrix[team].map(row => [...row])];

    console.log("null object?", pendingRepairMatrixBlock[team], team)

    updatedMatrix[pendingRepairMatrixBlock[team][0]][pendingRepairMatrixBlock[team][1]] = {
      ...updatedMatrix[pendingRepairMatrixBlock[team][0]][pendingRepairMatrixBlock[team][1]],
      system: blockSystem,
    };

    // check to see if two outer nodes have been connected
    const { isConnected, pathRowIndices, pathColumnIndices } = checkConnectedRepairMatrixPath(updatedMatrix, blockSystem);

    if (isConnected) {
      // heal the system
      console.log("regular heal", team, blockSystem)
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
    setRepairMatrix({...repairMatrix, [team]: updatedMatrix});

    const rotatedValues = rotateEngineerCompassValues(engineerCompassMap[team]);

    console.log(rotatedValues)

    const updatedTeamMap = {
        ...engineerCompassMap,
        [team]: {
            ...rotatedValues,
        }
    };

    setEngineerCompassMap(updatedTeamMap);

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
  const {
    playerTeam,
    setRepairMatrix,
    repairMatrix,
    getEmptyRepairMatrix,
    clearVisitedPath,
    getMessagePlayer,
    setCurrentlySurfacing,
    systemHealthLevels,
    setSystemHealthLevels,
    subLocations,
    setEnemyMovements,
    enemyMovements,
  } = context;

  const team = getMessagePlayer(message).team;

  if (team === playerTeam){
    setCurrentlySurfacing(true);
  }

  // Clear path
  clearVisitedPath(team);

  // Repair systems
  setSystemHealthLevels({
    ...systemHealthLevels, 
    [team]: {
      weapons: process.env.MAX_SYSTEM_HEALTH,
      scan: process.env.MAX_SYSTEM_HEALTH,
      engine: process.env.MAX_SYSTEM_HEALTH,
      comms: process.env.MAX_SYSTEM_HEALTH,
      "life support": systemHealthLevels[team]["life support"],
    }
  });

  // Clear matrix
  setRepairMatrix({...repairMatrix, [team]: getEmptyRepairMatrix()});

  // Send to enemy radio operator
  if(playerTeam !== team){
    const sector = getCellSector(subLocations[team]);
    setEnemyMovements([...enemyMovements, `surface(${sector})`]);
  }

}

// Engineer clears the systems
// MESSAGE: {}
export function engineerClearSystems(context, message){
  const {
    playerTeam,
    healSystem,
    setSystemHealthLevels,
    systemHealthLevels,
    getMessagePlayer,
    getEmptyRepairMatrix,
    setRepairMatrix,
    repairMatrix,
  } = context;

  const team = getMessagePlayer(message).team;

  const tempHealthLevels = {}
  // Heal all systems
  ENGINEER_SYSTEMS_INFO.forEach(systemInfo => {
    if (systemInfo.name !== "life support") {
        // Damage the life support
        tempHealthLevels[systemInfo.name] = process.env.MAX_SYSTEM_HEALTH
    }
  });

  tempHealthLevels["life support"] = Math.max(systemHealthLevels[team]["life support"] - process.env.SYSTEM_DAMAGE_AMOUNT, 0)

  // Damage the life support
  setSystemHealthLevels({
    ...systemHealthLevels,
    [team]: tempHealthLevels,
  });

  // reset the repair matrix
  setRepairMatrix({...repairMatrix, [team]: getEmptyRepairMatrix()})

}

// First mate fires a torpedo
// MESSAGE: {row, column}
export function firstMateFireTorpedo(context, message){
  const {
    getMessagePlayer,
    setSystemChargeLevels,
    systemChargeLevels,
    damageSubs,
    updateLifeSupport,
    getCellsDistanceAway,
    manhattanDistance,
    subLocations,
    setSystemHealthLevels,
    systemHealthLevels,
  } = context;

  const team = getMessagePlayer(message).team;

  setSystemChargeLevels({
    ...systemChargeLevels,
    [team]: {
      ...systemChargeLevels[team],
      torpedo: 0,
    },
  });

  const hitCells = getCellsDistanceAway(message.data.row, message.data.column, process.env.MAX_TORPEDO_DAMAGE-1, false)
  const hits = hitCells.map(([row, col]) => {
    return process.env.MAX_TORPEDO_DAMAGE - manhattanDistance(row, col, message.data.row, message.data.column);
  });
  const oppositeTeam = team === "blue" ? "red" : "blue"
  const [oppRow, oppCol] = subLocations[oppositeTeam]
  const hitCellsIndex = hitCells.findIndex(([row, col]) => row === oppRow && col === oppCol);  

  if (hitCellsIndex !== -1) {
    const updatedLifeSupport = updateLifeSupport(oppositeTeam, hits[hitCellsIndex]);
    setSystemHealthLevels({
      ...systemHealthLevels,
      [oppositeTeam]: {
        ...systemHealthLevels[oppositeTeam], // Spread the existing team properties
        "life support": updatedLifeSupport, // Update the life support value
      },
    });
  }
}

// First mate drops a mine
// MESSAGE: {row, column}
export function firstMateDropMine(context, message){
  const {
    getMessagePlayer,
    setSystemChargeLevels,
    systemChargeLevels,
    minesList,
    setMinesList,
    notificationMessages,
    setNotificationMessages,
    messageTimestamp,
    setMessageTimestamp
  } = context;

  console.log("Dropped Mine")

  const team = getMessagePlayer(message).team;

  // setSystemChargeLevels({
  //   ...systemChargeLevels,
  //   [team]: {
  //     ...systemChargeLevels[team],
  //     mine: 0,
  //   },
  // });

  const notificationMessage = {
    team,
    sameTeamMessage: `Successfully Dropped Mine on ${getCellName(message.data.row, message.data.column)}`,
    oppTeamMessage: null,
    intendedPlayer: "all", // You can specify a player here if needed
    severitySameTeam: "info",
    severityOppTeam: null,
    timestamp: messageTimestamp,
  };

  setMessageTimestamp(messageTimestamp + 1)

  // Add a notification message
  setNotificationMessages([...notificationMessages, notificationMessage]);

  setMinesList({...minesList,
  [team]: [...minesList[team], [message.data.row, message.data.column]]})

}

// First mate detonates a mine
// MESSAGE: {row, column}
export function firstMateDetonateMine(context, message){
  const {
    getMessagePlayer,
    setSystemChargeLevels,
    systemChargeLevels,
    updateLifeSupport,
    getCellsDistanceAway,
    manhattanDistance,
    subLocations,
    setSystemHealthLevels,
    systemHealthLevels,
    minesList,
    detonateWeapon,
    setMinesList,
    messageTimestamp,
    setMessageTimestamp,
    setNotificationMessages,
    notificationMessages,
  } = context;

  let tempMessages = []
  let tempTimestamp = messageTimestamp

  // Define the teams
  const team = getMessagePlayer(message).team;
  const oppositeTeam = team === "blue" ? "red" : "blue"
  
  let updatedOppMinesList = JSON.parse(JSON.stringify(minesList[oppositeTeam]));
  let updatedOwnMinesList = JSON.parse(JSON.stringify(minesList[team]));

  let torpedoDetonated = []
  let ownMinesDetonated = [[message.data.row, message.data.column]]
  let oppMinesDetonated = []

  let updatedDamageMap = {}
  while (ownMinesDetonated.length > 0 || oppMinesDetonated.length > 0 || torpedoDetonated.length > 0) {

    // Create the notification messages
    oppMinesDetonated.forEach(([row, col]) => {
      const notificationMessage = {
        oppositeTeam,
        sameTeamMessage: `Detonated Mine at ${getCellName(row, col)})`,
        oppTeamMessage: `Opponent's mine detonated at ${getCellName(row, col)}`,
        intendedPlayer: "all", // You can specify a player here if needed
        severitySameTeam: "info",
        severityOppTeam: "warning",
        timestamp: tempTimestamp,
      };
      tempTimestamp += 1
      tempMessages.push(notificationMessage)
    });

    ownMinesDetonated.forEach(([row, col]) => {
      const notificationMessage = {
        team,
        sameTeamMessage: `Detonated Mine at ${getCellName(row, col)}`,
        oppTeamMessage: `Opponent's mine detonated at ${getCellName(row, col)}`,
        intendedPlayer: "all", // You can specify a player here if needed
        severitySameTeam: "info",
        severityOppTeam: "warning",
        timestamp: tempTimestamp,
      };
      tempTimestamp += 1
      tempMessages.push(notificationMessage)
    });
    
    // detonateWeapon(torpedoDetonated, [], updatedDamageMap, allHitCells, process.env.MAX_MINE_DAMAGE)
    const ownMinesResult = detonateWeapon(ownMinesDetonated, updatedOwnMinesList, updatedDamageMap, process.env.MAX_MINE_DAMAGE)
    updatedOwnMinesList = ownMinesResult.listToUpdate
    updatedDamageMap = ownMinesResult.updatedDamageMap

    const oppMinesResult = detonateWeapon(oppMinesDetonated, updatedOppMinesList, updatedDamageMap, process.env.MAX_MINE_DAMAGE)
    updatedOppMinesList = oppMinesResult.listToUpdate
    updatedDamageMap = ownMinesResult.updatedDamageMap

    const combinedHitCells = [...ownMinesResult.allHitCells, ...oppMinesResult.allHitCells]

    // Check if any other mineIndices were detonated
    ownMinesDetonated = combinedHitCells.filter(([row, col]) => {
      // Check if the cell [row, col] is present in updatedOwnMinesList
      return updatedOwnMinesList.some(([mineRow, mineCol]) => mineRow === row && mineCol === col);
    });

    // Check if any other mineIndices were detonated
    oppMinesDetonated = combinedHitCells.filter(([row, col]) => {
      // Check if the cell [row, col] is present in updatedOwnMinesList
      return updatedOppMinesList.some(([mineRow, mineCol]) => mineRow === row && mineCol === col);
    });
    
  }

  const ownHits = updatedDamageMap[`${subLocations[team][0]}-${subLocations[team][1]}`] ?? 0;
  const oppHits = updatedDamageMap[`${subLocations[oppositeTeam][0]}-${subLocations[oppositeTeam][1]}`] ?? 0;

  const ownUpdatedLifeSupport = updateLifeSupport(team, ownHits);
  const oppUpdatedLifeSupport = updateLifeSupport(oppositeTeam, oppHits);

  // Set the updated mines list
  setMinesList({
    [team]: updatedOwnMinesList,
    [oppositeTeam]: updatedOppMinesList
  })

  // Update the life support after the craziness
  setSystemHealthLevels({
    ...systemHealthLevels,
    [team]: {
      ...systemHealthLevels[team],
      "life support": ownUpdatedLifeSupport, // Update your team's life support
    },
    [oppositeTeam]: {
      ...systemHealthLevels[oppositeTeam],
      "life support": oppUpdatedLifeSupport, // Update the opposite team's life support
    },
  });

  console.log("tempMessages", tempMessages)

  // Add a notification message
  setMessageTimestamp(messageTimestamp + tempTimestamp)
  setNotificationMessages([...notificationMessages, ...tempMessages]);

}

// First mate uses up their scan charge
// MESSAGE: {}
export function firstMateScan(context, message){
  const {
    getMessagePlayer,
    setSystemChargeLevels,
    systemChargeLevels,
  } = context;
  
  const team = getMessagePlayer(message).team;

  // Reduce the charge of the scan system to 0
  setSystemChargeLevels({
    ...systemChargeLevels,
    [team]: {
      ...systemChargeLevels[team],
      scan: 0,
    },
  });
}
