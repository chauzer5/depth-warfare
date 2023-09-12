import { ENGINEER_SYSTEMS_INFO, getCellSector, getCellName, keepLastNElements, capitalizeFirstLetter } from "../utils";

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
    pendingSystemCharge,
    getMessagePlayer,
    engineerPendingBlock,
    engineerHealSystem,
    setEngineerPendingBlock,
    setEngineerHealSystem,
    finishTurn
  } = context;

  const team = getMessagePlayer(message).team;

  if (!pendingSystemCharge[team]) {
    setEngineerPendingBlock({...engineerPendingBlock, [team]: message.data.clickedCell})
    setEngineerHealSystem({...engineerHealSystem, [team]: message.data.healSystem})
  } else {
    finishTurn(message.data.healSystem, pendingSystemCharge[team], team)
  }
}

// first mate choses something to activate
// MESSAGE: {system}
export function firstMateChooseSystemCharge(context, message){
  const {
    pendingSystemCharge,
    getMessagePlayer,
    setPendingSystemCharge,
    engineerPendingBlock,
    engineerHealSystem,
    finishTurn
  } = context;

  const team = getMessagePlayer(message).team;

  if (!engineerPendingBlock[team]) {
    setPendingSystemCharge({ ...pendingSystemCharge, [team]: message.data.system });
  }
  else {
    // This means we are second to go this turn
    // engineerHealSystem[team] should already be assigned
    finishTurn(engineerHealSystem[team], message.data.system, team)
  }
}

//Captain can change his mind on a move he makes
// MESSAGE: {}
export function captainCancelSubNavigate(context, message){
  const {
    pendingNavigate,
    setPendingNavigate,
    pendingRepairMatrixBlock,
    setEngineerPendingBlock,
    pendingSystemCharge,
    setPendingSystemCharge,
    getMessagePlayer,
    engineerPendingBlock
  } = context;

  const team = getMessagePlayer(message).team;

  setPendingNavigate({ ...pendingNavigate, [team]: null });
  setEngineerPendingBlock({ ...engineerPendingBlock, [team]: null });
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
    movements,
    setMovements,
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
  setMovements({...movements, [team]: [...movements[team], "silence"]});

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
    setMovements,
    movements,
    currentlySurfacing,
  } = context;

  const team = getMessagePlayer(message).team;

  if (team === playerTeam){
    setCurrentlySurfacing({...currentlySurfacing, [team] : true});
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
  const sector = getCellSector(subLocations[team]);
  setMovements({...movements, [team]: [...movements[team], `surface(${sector})`]});


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

}

// First mate fires a torpedo
// MESSAGE: {row, column}
export function firstMateFireTorpedo(context, message){
  const {
    getMessagePlayer,
    updateLifeSupport,
    subLocations,
    setSystemHealthLevels,
    systemHealthLevels,
    setSystemChargeLevels,
    systemChargeLevels,
    minesList,
    detonateWeapon,
    setMinesList,
    messageTimestamp,
    setMessageTimestamp,
    setNotificationMessages,
    notificationMessages,
    setCurrentStage,
  } = context;

  const team = getMessagePlayer(message).team;
  const oppositeTeam = team === "blue" ? "red" : "blue"

  setSystemChargeLevels({
    ...systemChargeLevels,
    [team]: {
      ...systemChargeLevels[team],
      torpedo: 0,
    },
  });

  let tempMessages = []
  let tempTimestamp = messageTimestamp
  
  let updatedOppMinesList = JSON.parse(JSON.stringify(minesList[oppositeTeam]));
  let updatedOwnMinesList = JSON.parse(JSON.stringify(minesList[team]));

  let ownTorpedoDetonated = [[message.data.row, message.data.column]]
  let ownMinesDetonated = []
  let oppMinesDetonated = []

  let updatedDamageMap = {}

  const notificationMessage = {
    team,
    sameTeamMessage: `Torpedo Launched at ${getCellName(message.data.row, message.data.column)}`,
    oppTeamMessage: `Opponent torpedo launched at ${getCellName(message.data.row, message.data.column)}`,
    intendedPlayer: "all", // You can specify a player here if needed
    severitySameTeam: "info",
    severityOppTeam: "warning",
    timestamp: tempTimestamp,
  };
  tempTimestamp += 1
  tempMessages.push(notificationMessage)

  while (ownMinesDetonated.length > 0 || oppMinesDetonated.length > 0 || ownTorpedoDetonated.length > 0) {

    // Create the notification messages
    oppMinesDetonated.forEach(([row, col]) => {
      const notificationMessage = {
        oppositeTeam,
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

    const ownTorpedoResult = detonateWeapon(ownTorpedoDetonated, [], updatedDamageMap, process.env.MAX_TORPEDO_DAMAGE)
    updatedDamageMap = ownTorpedoResult.updatedDamageMap

    const ownMinesResult = detonateWeapon(ownMinesDetonated, updatedOwnMinesList, updatedDamageMap, process.env.MAX_MINE_DAMAGE)
    updatedOwnMinesList = ownMinesResult.listToUpdate
    updatedDamageMap = ownMinesResult.updatedDamageMap

    const oppMinesResult = detonateWeapon(oppMinesDetonated, updatedOppMinesList, updatedDamageMap, process.env.MAX_MINE_DAMAGE)
    updatedOppMinesList = oppMinesResult.listToUpdate
    updatedDamageMap = ownMinesResult.updatedDamageMap

    const combinedHitCells = [...ownTorpedoResult.allHitCells, ...ownMinesResult.allHitCells, ...oppMinesResult.allHitCells]

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

    ownTorpedoDetonated = []
    
  }

  const ownHits = updatedDamageMap[`${subLocations[team][0]}-${subLocations[team][1]}`] ?? 0;
  const oppHits = updatedDamageMap[`${subLocations[oppositeTeam][0]}-${subLocations[oppositeTeam][1]}`] ?? 0;

  if (oppHits > 0) {
    const notificationMessage = {
      team,
      sameTeamMessage: `Opponent sub received ${oppHits * process.env.SYSTEM_DAMAGE_AMOUNT}% damage!`,
      oppTeamMessage: `Your sub recieved ${oppHits * process.env.SYSTEM_DAMAGE_AMOUNT}% damage!`,
      intendedPlayer: "all", // You can specify a player here if needed
      severitySameTeam: "success",
      severityOppTeam: "error",
      timestamp: tempTimestamp,
    };
    tempTimestamp += 1
    tempMessages.push(notificationMessage)
  }

  if (ownHits > 0) {
    const notificationMessage = {
      team,
      sameTeamMessage: `Your sub received ${ownHits * process.env.SYSTEM_DAMAGE_AMOUNT}% damage!`,
      oppTeamMessage: `Opponent sub recieved ${ownHits * process.env.SYSTEM_DAMAGE_AMOUNT}% damage!`,
      intendedPlayer: "all", // You can specify a player here if needed
      severitySameTeam: "error",
      severityOppTeam: "success",
      timestamp: tempTimestamp,
    };
    tempTimestamp += 1
    tempMessages.push(notificationMessage)
  }

  const ownUpdatedLifeSupport = updateLifeSupport(team, ownHits);
  const oppUpdatedLifeSupport = updateLifeSupport(oppositeTeam, oppHits);

  // Potentially end the game
  if(ownUpdatedLifeSupport <= 0 || oppUpdatedLifeSupport <= 0){
    setCurrentStage("game-end");
  }

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

  // Add a notification message
  setMessageTimestamp(tempTimestamp)
  setNotificationMessages(keepLastNElements([...notificationMessages, ...tempMessages], process.env.MAX_MESSAGES))
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

  const team = getMessagePlayer(message).team;

  setSystemChargeLevels({
    ...systemChargeLevels,
    [team]: {
      ...systemChargeLevels[team],
      mine: 0,
    },
  });

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
  setNotificationMessages(keepLastNElements([...notificationMessages, notificationMessage], process.env.MAX_MESSAGES))

  setMinesList({...minesList,
  [team]: [...minesList[team], [message.data.row, message.data.column]]})

}

// First mate detonates a mine
// MESSAGE: {row, column}
export function firstMateDetonateMine(context, message){
  const {
    getMessagePlayer,
    updateLifeSupport,
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
    setCurrentStage,
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

  if (oppHits > 0) {
    const notificationMessage = {
      team,
      sameTeamMessage: `Opponent sub received ${oppHits * process.env.SYSTEM_DAMAGE_AMOUNT}% damage!`,
      oppTeamMessage: `Your sub recieved ${oppHits * process.env.SYSTEM_DAMAGE_AMOUNT}% damage!`,
      intendedPlayer: "all", // You can specify a player here if needed
      severitySameTeam: "success",
      severityOppTeam: "error",
      timestamp: tempTimestamp,
    };
    tempTimestamp += 1
    tempMessages.push(notificationMessage)
  }

  if (ownHits > 0) {
    const notificationMessage = {
      team,
      sameTeamMessage: `Your sub received ${ownHits * process.env.SYSTEM_DAMAGE_AMOUNT}% damage!`,
      oppTeamMessage: `Opponent sub recieved ${ownHits * process.env.SYSTEM_DAMAGE_AMOUNT}% damage!`,
      intendedPlayer: "all", // You can specify a player here if needed
      severitySameTeam: "error",
      severityOppTeam: "success",
      timestamp: tempTimestamp,
    };
    tempTimestamp += 1
    tempMessages.push(notificationMessage)
  }

  const ownUpdatedLifeSupport = updateLifeSupport(team, ownHits);
  const oppUpdatedLifeSupport = updateLifeSupport(oppositeTeam, oppHits);

  // Potentially end the game
  if(ownUpdatedLifeSupport <= 0 || oppUpdatedLifeSupport <= 0){
    setCurrentStage("game-end");
  }

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

  // Add a notification message
  setMessageTimestamp(tempTimestamp)
  setNotificationMessages(keepLastNElements([...notificationMessages, ...tempMessages], process.env.MAX_MESSAGES))
}

// First mate uses up their scan charge
// MESSAGE: {}
export function firstMateScan(context, message){
  const {
    getMessagePlayer,
    setSystemChargeLevels,
    systemChargeLevels,
    scanForEnemySub,
    messageTimestamp,
    setMessageTimestamp,
    setNotificationMessages,
    notificationMessages,
  } = context;
  
  const team = getMessagePlayer(message).team;

  const notificationMessage = {
      team,
      sameTeamMessage: message.data.scanResult ? "Scan successful" : "Scan failed",
      oppTeamMessage: null,
      intendedPlayer: "first-mate", // You can specify a player here if needed
      severitySameTeam: message.data.scanResult ? "success" : "error",
      severityOppTeam: null,
      timestamp: messageTimestamp,
  };

  setMessageTimestamp(messageTimestamp + 1)
  setNotificationMessages(keepLastNElements([...notificationMessages, notificationMessage], process.env.MAX_MESSAGES))
  
  // Reduce the charge of the scan system to 0
  setSystemChargeLevels({
    ...systemChargeLevels,
    [team]: {
      ...systemChargeLevels[team],
      scan: 0,
    },
  });
}
