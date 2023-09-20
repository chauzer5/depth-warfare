import {
  getCellSector,
  getCellName,
  keepLastNElements,
} from "../utils";

// This function lets the captain pick a starting point
// MESSAGE: {row, column}
export function captainSetStartingSpot(context, message) {
  const { moveSub, getMessagePlayer, subLocations } = context;

  const team = getMessagePlayer(message).team;

  let allDone = false;

  const networkState = moveSub(team, message.data.row, message.data.column);

  if (subLocations[team === "blue" ? "red" : "blue"]) {
    allDone = true;
  }

  if (allDone) {
    networkState["currentStage"] = "countdown";
  }

  return networkState;
}

// This is the one where the captain picks a direction to go,
// This should trigger when the engineer and first mate can start their decisions
// MESSAGE: {direction}
export function captainStartSubNavigate(context, message) {
  const { pendingNavigate, getMessagePlayer } = context;

  const team = getMessagePlayer(message).team;

  return {
    pendingNavigate: { ...pendingNavigate, [team]: message.data.direction },
  };
}

//engineer picks the systems to activate, which will damage it each turn
// MESSAGE: {row, column}
export function engineerPlaceSystemBlock(context, message) {
  const {
    pendingSystemCharge,
    getMessagePlayer,
    engineerPendingBlock,
    engineerHealSystem,
    finishTurn,
  } = context;

  const team = getMessagePlayer(message).team;

  let networkState = {};

  if (!pendingSystemCharge[team]) {
    networkState = {
      engineerPendingBlock: {
        ...engineerPendingBlock,
        [team]: message.data.clickedCell,
      },
      engineerHealSystem: {
        ...engineerHealSystem,
        [team]: message.data.healSystem,
      },
    };
  } else {
    networkState = finishTurn(
      message.data.healSystem,
      pendingSystemCharge[team],
      team
    );
  }

  return networkState;
}

// first mate choses something to activate
// MESSAGE: {system}
export function firstMateChooseSystemCharge(context, message) {
  const {
    pendingSystemCharge,
    getMessagePlayer,
    engineerPendingBlock,
    engineerHealSystem,
    finishTurn,
  } = context;

  const team = getMessagePlayer(message).team;

  let networkState = {};

  if (!engineerPendingBlock[team]) {
    networkState = {
      pendingSystemCharge: {
        ...pendingSystemCharge,
        [team]: message.data.system,
      },
    };
  } else {
    // This means we are second to go this turn
    // engineerHealSystem[team] should already be assigned
    networkState = finishTurn(
      engineerHealSystem[team],
      message.data.system,
      team
    );
  }

  return networkState;
}

//Captain can change his mind on a move he makes
// MESSAGE: {}
export function captainCancelSubNavigate(context, message) {
  const {
    pendingNavigate,
    pendingSystemCharge,
    getMessagePlayer,
    engineerPendingBlock,
  } = context;

  const team = getMessagePlayer(message).team;

  return {
    pendingNavigate: { ...pendingNavigate, [team]: null },
    engineerPendingBlock: { ...engineerPendingBlock, [team]: null },
    pendingSystemCharge: { ...pendingSystemCharge, [team]: null },
  };
}

// Captain uses the silence ability
// MESSAGE: {row, column}
export function captainSilence(context, message) {
  const { systemChargeLevels, getMessagePlayer, moveSub, movements } = context;

  const team = getMessagePlayer(message).team;

  // Move the sub to the chosen location
  const networkState = moveSub(team, message.data.row, message.data.column);

  networkState["systemChargeLevels"] = {
    ...systemChargeLevels,
    [team]: {
      ...systemChargeLevels[team],
      silence: 0,
    },
  };
  networkState["movements"] = {
    ...movements,
    [team]: [...movements[team], "silence"],
  };

  return networkState;
}

export function stopSurfacing(context, message) {
  const { getMessagePlayer, currentlySurfacing } = context;

  const team = getMessagePlayer(message).team;

  return {
    currentlySurfacing: { ...currentlySurfacing, [team]: false },
  };
}

// Captain triggers a "surface" event
// MESSAGE: {}
export function captainSurface(context, message) {
  const {
    clearVisitedPath,
    getMessagePlayer,
    systemHealthLevels,
    subLocations,
    movements,
    currentlySurfacing,
  } = context;

  const team = getMessagePlayer(message).team;

  // Clear path
  const updatedGameMap = clearVisitedPath(team);

  // Send to enemy radio operator
  const sector = getCellSector(subLocations[team]);

  return {
    currentlySurfacing: { ...currentlySurfacing, [team]: true },
    systemHealthLevels: {
      ...systemHealthLevels,
      [team]: {
        weapons: process.env.MAX_SYSTEM_HEALTH,
        scan: process.env.MAX_SYSTEM_HEALTH,
        engine: process.env.MAX_SYSTEM_HEALTH,
        comms: process.env.MAX_SYSTEM_HEALTH,
        "life support": systemHealthLevels[team]["life support"],
      },
    },
    movements: {
      ...movements,
      [team]: [...movements[team], `surface(${sector})`],
    },
    gameMap: updatedGameMap,
  };
}

// First mate fires a torpedo
// MESSAGE: {row, column}
export function firstMateFireTorpedo(context, message) {
  const {
    getMessagePlayer,
    updateLifeSupport,
    subLocations,
    systemHealthLevels,
    systemChargeLevels,
    minesList,
    detonateWeapon,
    messageTimestamp,
    notificationMessages,
  } = context;

  const team = getMessagePlayer(message).team;
  const oppositeTeam = team === "blue" ? "red" : "blue";

  const syncNetworkMessage = {
    systemChargeLevels: {
      ...systemChargeLevels,
      [team]: {
        ...systemChargeLevels[team],
        torpedo: 0,
      },
    },
  };

  let tempMessages = [];
  let tempTimestamp = messageTimestamp;

  let updatedOppMinesList = JSON.parse(JSON.stringify(minesList[oppositeTeam]));
  let updatedOwnMinesList = JSON.parse(JSON.stringify(minesList[team]));

  let ownTorpedoDetonated = [[message.data.row, message.data.column]];
  let ownMinesDetonated = [];
  let oppMinesDetonated = [];

  let updatedDamageMap = {};

  const notificationMessage = {
    team,
    sameTeamMessage: `Torpedo Launched at ${getCellName(
      message.data.row,
      message.data.column
    )}`,
    oppTeamMessage: `Opponent torpedo launched at ${getCellName(
      message.data.row,
      message.data.column
    )}`,
    intendedPlayer: "all", // You can specify a player here if needed
    severitySameTeam: "info",
    severityOppTeam: "warning",
    timestamp: tempTimestamp,
  };
  tempTimestamp += 1;
  tempMessages.push(notificationMessage);

  while (
    ownMinesDetonated.length > 0 ||
    oppMinesDetonated.length > 0 ||
    ownTorpedoDetonated.length > 0
  ) {
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
      tempTimestamp += 1;
      tempMessages.push(notificationMessage);
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
      tempTimestamp += 1;
      tempMessages.push(notificationMessage);
    });

    const ownTorpedoResult = detonateWeapon(
      ownTorpedoDetonated,
      [],
      updatedDamageMap,
      process.env.MAX_TORPEDO_DAMAGE
    );
    updatedDamageMap = ownTorpedoResult.updatedDamageMap;

    const ownMinesResult = detonateWeapon(
      ownMinesDetonated,
      updatedOwnMinesList,
      updatedDamageMap,
      process.env.MAX_MINE_DAMAGE
    );
    updatedOwnMinesList = ownMinesResult.listToUpdate;
    updatedDamageMap = ownMinesResult.updatedDamageMap;

    const oppMinesResult = detonateWeapon(
      oppMinesDetonated,
      updatedOppMinesList,
      updatedDamageMap,
      process.env.MAX_MINE_DAMAGE
    );
    updatedOppMinesList = oppMinesResult.listToUpdate;
    updatedDamageMap = ownMinesResult.updatedDamageMap;

    const combinedHitCells = [
      ...ownTorpedoResult.allHitCells,
      ...ownMinesResult.allHitCells,
      ...oppMinesResult.allHitCells,
    ];

    // Check if any other mineIndices were detonated
    ownMinesDetonated = combinedHitCells.filter(([row, col]) => {
      // Check if the cell [row, col] is present in updatedOwnMinesList
      return updatedOwnMinesList.some(
        ([mineRow, mineCol]) => mineRow === row && mineCol === col
      );
    });

    // Check if any other mineIndices were detonated
    oppMinesDetonated = combinedHitCells.filter(([row, col]) => {
      // Check if the cell [row, col] is present in updatedOwnMinesList
      return updatedOppMinesList.some(
        ([mineRow, mineCol]) => mineRow === row && mineCol === col
      );
    });

    ownTorpedoDetonated = [];
  }

  const ownHits =
    updatedDamageMap[`${subLocations[team][0]}-${subLocations[team][1]}`] ?? 0;
  const oppHits =
    updatedDamageMap[
      `${subLocations[oppositeTeam][0]}-${subLocations[oppositeTeam][1]}`
    ] ?? 0;

  if (oppHits > 0) {
    const notificationMessage = {
      team,
      sameTeamMessage: `Opponent sub received ${
        oppHits * process.env.SYSTEM_DAMAGE_AMOUNT
      }% damage!`,
      oppTeamMessage: `Your sub recieved ${
        oppHits * process.env.SYSTEM_DAMAGE_AMOUNT
      }% damage!`,
      intendedPlayer: "all", // You can specify a player here if needed
      severitySameTeam: "success",
      severityOppTeam: "error",
      timestamp: tempTimestamp,
    };
    tempTimestamp += 1;
    tempMessages.push(notificationMessage);
  }

  if (ownHits > 0) {
    const notificationMessage = {
      team,
      sameTeamMessage: `Your sub received ${
        ownHits * process.env.SYSTEM_DAMAGE_AMOUNT
      }% damage!`,
      oppTeamMessage: `Opponent sub recieved ${
        ownHits * process.env.SYSTEM_DAMAGE_AMOUNT
      }% damage!`,
      intendedPlayer: "all", // You can specify a player here if needed
      severitySameTeam: "error",
      severityOppTeam: "success",
      timestamp: tempTimestamp,
    };
    tempTimestamp += 1;
    tempMessages.push(notificationMessage);
  }

  const ownUpdatedLifeSupport = updateLifeSupport(team, ownHits);
  const oppUpdatedLifeSupport = updateLifeSupport(oppositeTeam, oppHits);

  // Potentially end the game
  if (ownUpdatedLifeSupport <= 0 || oppUpdatedLifeSupport <= 0) {
    syncNetworkMessage["currentStage"] = "game-end";
  }

  // Set the updated mines list
  syncNetworkMessage["minesList"] = {
    [team]: updatedOwnMinesList,
    [oppositeTeam]: updatedOppMinesList,
  };

  syncNetworkMessage["systemHealthLevels"] = {
    ...systemHealthLevels,
    [team]: {
      ...systemHealthLevels[team],
      "life support": ownUpdatedLifeSupport, // Update your team's life support
    },
    [oppositeTeam]: {
      ...systemHealthLevels[oppositeTeam],
      "life support": oppUpdatedLifeSupport, // Update the opposite team's life support
    },
  };

  syncNetworkMessage["messageTimestamp"] = tempTimestamp;
  syncNetworkMessage["notificationMessages"] = keepLastNElements(
    [...notificationMessages, ...tempMessages],
    process.env.MAX_MESSAGES
  );

  return syncNetworkMessage;
}

// First mate drops a mine
// MESSAGE: {row, column}
export function firstMateDropMine(context, message) {
  const {
    getMessagePlayer,
    systemChargeLevels,
    minesList,
    notificationMessages,
    messageTimestamp,
  } = context;

  const team = getMessagePlayer(message).team;

  const syncNetworkMessage = {
    systemChargeLevels: {
      ...systemChargeLevels,
      [team]: {
        ...systemChargeLevels[team],
        mine: 0,
      },
    },
  };

  const notificationMessage = {
    team,
    sameTeamMessage: `Successfully Dropped Mine on ${getCellName(
      message.data.row,
      message.data.column
    )}`,
    oppTeamMessage: null,
    intendedPlayer: "all", // You can specify a player here if needed
    severitySameTeam: "info",
    severityOppTeam: null,
    timestamp: messageTimestamp,
  };

  syncNetworkMessage["messageTimestamp"] = messageTimestamp + 1;
  syncNetworkMessage["notificationMessages"] = keepLastNElements(
    [...notificationMessages, notificationMessage],
    process.env.MAX_MESSAGES
  );
  syncNetworkMessage["minesList"] = {
    ...minesList,
    [team]: [...minesList[team], [message.data.row, message.data.column]],
  };

  return syncNetworkMessage;
}

// First mate detonates a mine
// MESSAGE: {row, column}
export function firstMateDetonateMine(context, message) {
  const {
    getMessagePlayer,
    updateLifeSupport,
    subLocations,
    systemHealthLevels,
    minesList,
    detonateWeapon,
    messageTimestamp,
    notificationMessages,
  } = context;

  let tempMessages = [];
  let tempTimestamp = messageTimestamp;

  // Define the teams
  const team = getMessagePlayer(message).team;
  const oppositeTeam = team === "blue" ? "red" : "blue";

  let updatedOppMinesList = JSON.parse(JSON.stringify(minesList[oppositeTeam]));
  let updatedOwnMinesList = JSON.parse(JSON.stringify(minesList[team]));

  let torpedoDetonated = [];
  let ownMinesDetonated = [[message.data.row, message.data.column]];
  let oppMinesDetonated = [];

  let updatedDamageMap = {};
  while (
    ownMinesDetonated.length > 0 ||
    oppMinesDetonated.length > 0 ||
    torpedoDetonated.length > 0
  ) {
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
      tempTimestamp += 1;
      tempMessages.push(notificationMessage);
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
      tempTimestamp += 1;
      tempMessages.push(notificationMessage);
    });

    // detonateWeapon(torpedoDetonated, [], updatedDamageMap, allHitCells, process.env.MAX_MINE_DAMAGE)
    const ownMinesResult = detonateWeapon(
      ownMinesDetonated,
      updatedOwnMinesList,
      updatedDamageMap,
      process.env.MAX_MINE_DAMAGE
    );
    updatedOwnMinesList = ownMinesResult.listToUpdate;
    updatedDamageMap = ownMinesResult.updatedDamageMap;

    const oppMinesResult = detonateWeapon(
      oppMinesDetonated,
      updatedOppMinesList,
      updatedDamageMap,
      process.env.MAX_MINE_DAMAGE
    );
    updatedOppMinesList = oppMinesResult.listToUpdate;
    updatedDamageMap = ownMinesResult.updatedDamageMap;

    const combinedHitCells = [
      ...ownMinesResult.allHitCells,
      ...oppMinesResult.allHitCells,
    ];

    // Check if any other mineIndices were detonated
    ownMinesDetonated = combinedHitCells.filter(([row, col]) => {
      // Check if the cell [row, col] is present in updatedOwnMinesList
      return updatedOwnMinesList.some(
        ([mineRow, mineCol]) => mineRow === row && mineCol === col
      );
    });

    // Check if any other mineIndices were detonated
    oppMinesDetonated = combinedHitCells.filter(([row, col]) => {
      // Check if the cell [row, col] is present in updatedOwnMinesList
      return updatedOppMinesList.some(
        ([mineRow, mineCol]) => mineRow === row && mineCol === col
      );
    });
  }

  const ownHits =
    updatedDamageMap[`${subLocations[team][0]}-${subLocations[team][1]}`] ?? 0;
  const oppHits =
    updatedDamageMap[
      `${subLocations[oppositeTeam][0]}-${subLocations[oppositeTeam][1]}`
    ] ?? 0;

  if (oppHits > 0) {
    const notificationMessage = {
      team,
      sameTeamMessage: `Opponent sub received ${
        oppHits * process.env.SYSTEM_DAMAGE_AMOUNT
      }% damage!`,
      oppTeamMessage: `Your sub recieved ${
        oppHits * process.env.SYSTEM_DAMAGE_AMOUNT
      }% damage!`,
      intendedPlayer: "all", // You can specify a player here if needed
      severitySameTeam: "success",
      severityOppTeam: "error",
      timestamp: tempTimestamp,
    };
    tempTimestamp += 1;
    tempMessages.push(notificationMessage);
  }

  if (ownHits > 0) {
    const notificationMessage = {
      team,
      sameTeamMessage: `Your sub received ${
        ownHits * process.env.SYSTEM_DAMAGE_AMOUNT
      }% damage!`,
      oppTeamMessage: `Opponent sub recieved ${
        ownHits * process.env.SYSTEM_DAMAGE_AMOUNT
      }% damage!`,
      intendedPlayer: "all", // You can specify a player here if needed
      severitySameTeam: "error",
      severityOppTeam: "success",
      timestamp: tempTimestamp,
    };
    tempTimestamp += 1;
    tempMessages.push(notificationMessage);
  }

  const ownUpdatedLifeSupport = updateLifeSupport(team, ownHits);
  const oppUpdatedLifeSupport = updateLifeSupport(oppositeTeam, oppHits);

  const syncNetworkMessage = {};

  // Potentially end the game
  if (ownUpdatedLifeSupport <= 0 || oppUpdatedLifeSupport <= 0) {
    syncNetworkMessage["currentStage"] = "game-end";
  }

  // Set the updated mines list
  syncNetworkMessage["minesList"] = {
    [team]: updatedOwnMinesList,
    [oppositeTeam]: updatedOppMinesList,
  };

  // Update the life support after the craziness
  syncNetworkMessage["systemHealthLevels"] = {
    ...systemHealthLevels,
    [team]: {
      ...systemHealthLevels[team],
      "life support": ownUpdatedLifeSupport, // Update your team's life support
    },
    [oppositeTeam]: {
      ...systemHealthLevels[oppositeTeam],
      "life support": oppUpdatedLifeSupport, // Update the opposite team's life support
    },
  };

  syncNetworkMessage["messageTimestamp"] = tempTimestamp;
  syncNetworkMessage["notificationMessages"] = keepLastNElements(
    [...notificationMessages, ...tempMessages],
    process.env.MAX_MESSAGES
  );

  return syncNetworkMessage;
}

// First mate uses up their scan charge
// MESSAGE: {}
export function firstMateScan(context, message) {
  const {
    getMessagePlayer,
    systemChargeLevels,
    messageTimestamp,
    notificationMessages,
  } = context;

  const team = getMessagePlayer(message).team;

  const notificationMessage = {
    team,
    sameTeamMessage: message.data.scanResult
      ? "Scan successful"
      : "Scan failed",
    oppTeamMessage: null,
    intendedPlayer: "first-mate", // You can specify a player here if needed
    severitySameTeam: message.data.scanResult ? "success" : "error",
    severityOppTeam: null,
    timestamp: messageTimestamp,
  };

  return {
    messageTimestamp: messageTimestamp + 1,
    notificationMessages: keepLastNElements(
      [...notificationMessages, notificationMessage],
      process.env.MAX_MESSAGES
    ),
    systemChargeLevels: {
      ...systemChargeLevels,
      [team]: {
        ...systemChargeLevels[team],
        scan: 0,
      },
    },
  };
}

// Radio operator adds or removes a note from a cell
// MESSAGE: {row, column}
export function radioOperatorAddRemoveNote(context, message){
  const {
    radioMapNotes,
    getMessagePlayer
  } = context;

  const team = getMessagePlayer(message).team;
  const row = message.data.row;
  const column = message.data.column;

  if (radioMapNotes[team].find((note) => note[0] === row && note[1] === column)) {
    return {
      radioMapNotes: {
        ...radioMapNotes,
        [team]: radioMapNotes[team].filter((note) => note[0] !== row || note[1] !== column),
      }
    };
  } else {
    return {
      radioMapNotes: {
        ...radioMapNotes,
        [team]: [...radioMapNotes[team], [row, column]],
      },
    };
  }
}

// Radio operator clears all of his notes
// MESSAGE: {}
export function radioOperatorClearNotes(context, message){
  const {
    radioMapNotes,
    getMessagePlayer
  } = context;

  const team = getMessagePlayer(message).team;

  return {
    radioMapNotes: {
      ...radioMapNotes,
      [team]: []
    }
  };
}

// Radio operator shifts all the notes in a direction
// MESSAGE: {direction}
export function radioOperatorShiftNotes(context, message){
  const {
    radioMapNotes,
    getMessagePlayer
  } = context;

  const team = getMessagePlayer(message).team;
  const direction = message.data.direction;

  const updatedNotes = radioMapNotes[team].map((note) => {
    switch (direction) {
      case "north":
        return [note[0] - 1, note[1]];
      case "south":
        return [note[0] + 1, note[1]];
      case "west":
        return [note[0], note[1] - 1];
      case "east":
        return [note[0], note[1] + 1];
      default:
        console.error(`Unrecognized direction: ${direction}`);
    }
  });

  return {
    radioMapNotes: {
      ...radioMapNotes,
      [team]: updatedNotes,
    },
  };
}

export function syncNetworkState(context, networkState) {
  const {
    setCurrentStage,
    setSubLocations,
    setGameMap,
    setSystemChargeLevels,
    setMovementCountOnDisable,
    setSystemHealthLevels,
    setEngineerCompassMap,
    setMovements,
    setPendingSystemCharge,
    setEngineerPendingBlock,
    setPendingNavigate,
    setEngineerHealSystem,
    setNotificationMessages,
    setMessageTimestamp,
    setCurrentlySurfacing,
    setMinesList,
    setRadioMapNotes,
  } = context;

  if (networkState.hasOwnProperty("currentStage")) {
    setCurrentStage(networkState.currentStage);
  }
  if (networkState.hasOwnProperty("subLocations")) {
    setSubLocations(networkState.subLocations);
  }
  if (networkState.hasOwnProperty("gameMap")) {
    setGameMap(networkState.gameMap);
  }
  if (networkState.hasOwnProperty("systemChargeLevels")) {
    setSystemChargeLevels(networkState.systemChargeLevels);
  }
  if (networkState.hasOwnProperty("movementCountOnDisable")) {
    setMovementCountOnDisable(networkState.movementCountOnDisable);
  }
  if (networkState.hasOwnProperty("systemHealthLevels")) {
    setSystemHealthLevels(networkState.systemHealthLevels);
  }
  if (networkState.hasOwnProperty("engineerCompassMap")) {
    setEngineerCompassMap(networkState.engineerCompassMap);
  }
  if (networkState.hasOwnProperty("movements")) {
    setMovements(networkState.movements);
  }
  if (networkState.hasOwnProperty("pendingSystemCharge")) {
    setPendingSystemCharge(networkState.pendingSystemCharge);
  }
  if (networkState.hasOwnProperty("engineerPendingBlock")) {
    setEngineerPendingBlock(networkState.engineerPendingBlock);
  }
  if (networkState.hasOwnProperty("pendingNavigate")) {
    setPendingNavigate(networkState.pendingNavigate);
  }
  if (networkState.hasOwnProperty("engineerHealSystem")) {
    setEngineerHealSystem(networkState.engineerHealSystem);
  }
  if (networkState.hasOwnProperty("notificationMessages")) {
    setNotificationMessages(networkState.notificationMessages);
  }
  if (networkState.hasOwnProperty("messageTimestamp")) {
    setMessageTimestamp(networkState.messageTimestamp);
  }
  if (networkState.hasOwnProperty("currentlySurfacing")) {
    setCurrentlySurfacing(networkState.currentlySurfacing);
  }
  if (networkState.hasOwnProperty("minesList")) {
    setMinesList(networkState.minesList);
  }
  if (networkState.hasOwnProperty("radioMapNotes")) {
    setRadioMapNotes(networkState.radioMapNotes);
  }
}
