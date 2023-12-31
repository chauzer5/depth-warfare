import {
  getCellSector,
  getCellName,
  keepLastNElements,
  SYSTEMS_INFO,
  getSystemMaxCharge,
} from "../utils";

// This function lets the captain pick a starting point
// MESSAGE: {row, column}
export function captainSetStartingSpot(context, message) {
  const {
    getMessagePlayer,
    moveSub,
    networkState,
    isNavigationDisabled,
    randomEnabledDirection,
  } = context;

  const { subLocations } = networkState;

  const team = getMessagePlayer(message).team;

  let allDone = false;

  const moveSubState = moveSub(team, message.data.row, message.data.column);

  const directions = ["north", "south", "west", "east"];
  const disabledDirectionStates = {};

  directions.forEach((direction) => {
    disabledDirectionStates[direction] = isNavigationDisabled(
      direction,
      team,
      moveSubState.gameMap,
      moveSubState.subLocations,
    );
  });

  const trueDirections = Object.keys(disabledDirectionStates).filter(
    (direction) => disabledDirectionStates[direction] === false,
  );

  const randomIndex = Math.floor(Math.random() * trueDirections.length);

  moveSubState["randomEnabledDirection"] = {
    ...randomEnabledDirection,
    [team]: trueDirections[randomIndex],
  };

  if (subLocations[team === "blue" ? "red" : "blue"]) {
    allDone = true;
  }

  if (allDone) {
    moveSubState["currentStage"] = "countdown";
  }

  return moveSubState;
}

// This is the one where the captain picks a direction to go,
// This should trigger when the engineer and first mate can start their decisions
// MESSAGE: {direction}
export function captainStartSubNavigate(context, message) {
  const { networkState, getMessagePlayer, isNavigationDisabled } = context;

  const { gameMap, subLocations, currentlySurfacing, pendingNavigate } =
    networkState;

  const team = getMessagePlayer(message).team;

  if (currentlySurfacing[team]) {
    return {};
  }

  if (
    isNavigationDisabled(message.data.direction, team, gameMap, subLocations)
  ) {
    return {};
  }

  return {
    pendingNavigate: { ...pendingNavigate, [team]: message.data.direction },
  };
}

//engineer picks the systems to activate, which will damage it each turn
// MESSAGE: {row, column}
export function engineerPlaceSystemBlock(context, message) {
  const { getMessagePlayer, finishTurn, networkState } = context;

  const {
    pendingSystemCharge,
    engineerPendingBlock,
    repairMatrix,
    pendingNavigate,
    currentlySurfacing,
  } = networkState;

  const team = getMessagePlayer(message).team;

  if (currentlySurfacing[team]) {
    return {};
  }
  let tempNetworkState = {};

  const { row, column } = message.data.clickedCell;

  const cell = repairMatrix[team][row][column];

  // Enforce valid block placement
  if (
    cell.type === "inner" &&
    cell.system === "empty" &&
    !engineerPendingBlock[team] &&
    pendingNavigate[team]
  ) {
    if (!pendingSystemCharge[team]) {
      tempNetworkState = {
        engineerPendingBlock: {
          ...engineerPendingBlock,
          [team]: message.data.clickedCell,
        },
      };
    } else {
      tempNetworkState = finishTurn(
        message.data.clickedCell,
        pendingSystemCharge[team],
        team,
      );
    }
  }

  return tempNetworkState;
}

export function engineerClearRepairMatrix(context, message) {
  const { getMessagePlayer, networkState } = context;

  const { repairMatrix, currentlySurfacing } = networkState;

  const team = getMessagePlayer(message).team;

  if (currentlySurfacing[team]) {
    return {};
  }

  const updatedMatrix = repairMatrix[team].map((row) =>
    row.map((cell) => ({
      ...cell,
      system: cell.type === "inner" ? "empty" : cell.system,
    })),
  );

  return { repairMatrix: { ...repairMatrix, [team]: updatedMatrix } };
}

// first mate choses something to activate
// MESSAGE: {system}
export function firstMateChooseSystemCharge(context, message) {
  const { getMessagePlayer, finishTurn, networkState } = context;

  const {
    pendingSystemCharge,
    engineerPendingBlock,
    systemChargeLevels,
    pendingNavigate,
    currentlySurfacing,
  } = networkState;

  const team = getMessagePlayer(message).team;

  if (currentlySurfacing[team]) {
    return {};
  }

  let tempNetworkState = {};

  console.log("check charge system", systemChargeLevels[team][message.data.system], getSystemMaxCharge(message.data.system), pendingNavigate[team], !pendingSystemCharge[team])

  // Enforce that we are able to charge the system we are looking at
  if (
    systemChargeLevels[team][message.data.system] <
      getSystemMaxCharge(message.data.system) &&
    pendingNavigate[team] &&
    !pendingSystemCharge[team]
  ) {
    if (!engineerPendingBlock[team]) {
      tempNetworkState = {
        pendingSystemCharge: {
          ...pendingSystemCharge,
          [team]: message.data.system,
        },
      };
    } else {
      // This means we are second to go this turn
      // engineerHealSystem[team] should already be assigned
      tempNetworkState = finishTurn(
        engineerPendingBlock[team],
        message.data.system,
        team,
      );
    }
  }

  return tempNetworkState;
}

//Captain can change his mind on a move he makes
// MESSAGE: {}
export function captainCancelSubNavigate(context, message) {
  const { networkState, getMessagePlayer } = context;

  const {
    pendingNavigate,
    pendingSystemCharge,
    engineerPendingBlock,
    currentlySurfacing,
  } = networkState;

  const team = getMessagePlayer(message).team;

  if (currentlySurfacing[team]) {
    return {};
  }

  return {
    pendingNavigate: { ...pendingNavigate, [team]: null },
    engineerPendingBlock: { ...engineerPendingBlock, [team]: null },
    pendingSystemCharge: { ...pendingSystemCharge, [team]: null },
  };
}

// Captain uses the boost ability
// MESSAGE: {row, column}
export function captainBoost(context, message) {
  const {
    networkState,
    getMessagePlayer,
    getValidBoostCells,
    isNavigationDisabled,
    moveSub,
  } = context;

  const {
    systemChargeLevels,
    movements,
    currentlySurfacing,
    pendingNavigate,
    randomEnabledDirection,
    subLocations,
    gameMap,
    gameStats,
  } = networkState;

  const team = getMessagePlayer(message).team;

  if (currentlySurfacing[team]) {
    return {};
  }

  if (pendingNavigate[team]) {
    return {};
  }

  //Enforcing silencing
  const validCells = getValidBoostCells(team, subLocations, gameMap);
  const arrayToCheck = [message.data.row, message.data.column];

  let isValid = validCells.some((arr) => {
    return (
      arr.length === arrayToCheck.length &&
      arr.every((element, index) => element === arrayToCheck[index])
    );
  });

  if (!isValid) {
    return {};
  }

  // Move the sub to the chosen location
  const tempNetworkState = moveSub(team, message.data.row, message.data.column);

  const directions = ["north", "south", "west", "east"];
  const disabledDirectionStates = {};

  directions.forEach((direction) => {
    disabledDirectionStates[direction] = isNavigationDisabled(
      direction,
      team,
      tempNetworkState.gameMap,
      tempNetworkState.subLocations,
    );
  });

  const trueDirections = Object.keys(disabledDirectionStates).filter(
    (direction) => disabledDirectionStates[direction] === false,
  );

  const randomIndex = Math.floor(Math.random() * trueDirections.length);

  tempNetworkState["randomEnabledDirection"] = {
    ...randomEnabledDirection,
    [team]: trueDirections[randomIndex],
  };

  tempNetworkState["systemChargeLevels"] = {
    ...systemChargeLevels,
    [team]: {
      ...systemChargeLevels[team],
      boost: 0,
    },
  };
  tempNetworkState["movements"] = {
    ...movements,
    [team]: [...movements[team], "boost"],
  };

  tempNetworkState["gameStats"] = {
    ...gameStats,
    [team]: {
      ...gameStats[team],
      timesBoosted: gameStats[team].timesBoosted + 1,
    },
  };

  return tempNetworkState;
}

export function stopSurfacing(context, message) {
  const { getMessagePlayer, networkState } = context;

  const { currentlySurfacing } = networkState;

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
    networkState,
    calculateMaxSystemHealth,
  } = context;

  const {
    systemHealthLevels,
    subLocations,
    movements,
    currentlySurfacing,
    repairMatrix,
    messageTimestamp,
    notificationMessages,
    gameStats,
  } = networkState;

  const team = getMessagePlayer(message).team;
  const oppositeTeam = team === "blue" ? "red" : "blue";

  console.log("surfaced:", team)
  console.log("game stats:", gameStats)

  // Clear path
  const updatedGameMap = clearVisitedPath(team);

  // Send to enemy radio operator
  const sector = getCellSector(subLocations[team]);

  const notificationMessage = {
    team: oppositeTeam,
    sameTeamMessage: `Opponent surfaced at sector ${sector}`,
    oppTeamMessage: null,
    intendedPlayer: "all", // You can specify a player here if needed
    severitySameTeam: "success",
    severityOppTeam: null,
    timestamp: messageTimestamp,
  }; 

  console.log("notifications", notificationMessage, 
  keepLastNElements([...notificationMessages, notificationMessage], process.env.MAX_MESSAGES))

  return {
    messageTimestamp: messageTimestamp + 1,
    notificationMessages: keepLastNElements(
      [...notificationMessages, notificationMessage],
      process.env.MAX_MESSAGES,
    ),
    currentlySurfacing: { ...currentlySurfacing, [team]: true },
    systemHealthLevels: {
      ...systemHealthLevels,
      [team]: {
        weapons: process.env.MAX_SYSTEM_HEALTH,
        probe: process.env.MAX_SYSTEM_HEALTH,
        engine: process.env.MAX_SYSTEM_HEALTH,
        sonar: process.env.MAX_SYSTEM_HEALTH,
        "life support": systemHealthLevels[team]["life support"],
      },
    },
    movements: {
      ...movements,
      [team]: [...movements[team], `surface(${sector})`],
    },
    gameMap: updatedGameMap,
    gameStats: {
      ...gameStats,
      [team]: {
        ...gameStats[team],
        timesSurfaced: gameStats[team].timesSurfaced + 1,
      },
    },
  };
}

// First mate fires a torpedo
// MESSAGE: {row, column}
export function firstMateFireTorpedo(context, message) {
  const {
    getMessagePlayer,
    updateLifeSupport,
    detonateWeapon,
    getCellsDistanceAway,
    networkState,
  } = context;

  const {
    subLocations,
    systemHealthLevels,
    systemChargeLevels,
    minesList,
    messageTimestamp,
    notificationMessages,
    currentlySurfacing,
    gameMap,
    gameStats,
  } = networkState;

  const team = getMessagePlayer(message).team;
  const oppositeTeam = team === "blue" ? "red" : "blue";
  const ownMultiplier = Math.round(systemHealthLevels[team]["weapons"] * .5 + 50)
  console.log("Health Levels", systemHealthLevels[team])
  // const oppMultiplier = systemHealthLevels[oppositeTeam]["weapons"] * .5 + 50

  if (currentlySurfacing[team]) {
    return {};
  }

  // If the torpedo isn't fully charged, don't do anything
  if (
    systemChargeLevels[team].torpedo <
    SYSTEMS_INFO.find((system) => system.name === "torpedo").maxCharge
  ) {
    return {};
  }

  // If the torpedo is disabled, don't do anything
  if (systemHealthLevels[team].weapons < 1) {
    return {};
  }

  // If the cell isn't within range, don't do anything
  const possibleTorpedoCells = getCellsDistanceAway(
    subLocations[team][0],
    subLocations[team][1],
    process.env.TORPEDO_RANGE,
  );
  if (
    !possibleTorpedoCells.find(
      (cell) => cell[0] === message.data.row && cell[1] === message.data.column,
    )
  ) {
    return {};
  }

  // If the cell is out of the map bounds, don't do anything
  if (
    message.data.column < 0 ||
    message.data.column >= process.env.MAP_DIMENSION ||
    message.data.row < 0 ||
    message.data.row >= process.env.MAP_DIMENSION
  ) {
    return {};
  }

  // If the cell is occupied by an island, don't do anything
  if (gameMap[message.data.row][message.data.column] === "island") {
    return {};
  }

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
      message.data.column,
    )}`,
    oppTeamMessage: `Opponent torpedo launched at ${getCellName(
      message.data.row,
      message.data.column,
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
      process.env.MAX_TORPEDO_DAMAGE,
      ownMultiplier
    );
    updatedDamageMap = ownTorpedoResult.updatedDamageMap;

    const ownMinesResult = detonateWeapon(
      ownMinesDetonated,
      updatedOwnMinesList,
      updatedDamageMap,
      process.env.MAX_MINE_DAMAGE,
    );
    updatedOwnMinesList = ownMinesResult.listToUpdate;
    updatedDamageMap = ownMinesResult.updatedDamageMap;

    const oppMinesResult = detonateWeapon(
      oppMinesDetonated,
      updatedOppMinesList,
      updatedDamageMap,
      process.env.MAX_MINE_DAMAGE,
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
        ([mineRow, mineCol]) => mineRow === row && mineCol === col,
      );
    });

    // Check if any other mineIndices were detonated
    oppMinesDetonated = combinedHitCells.filter(([row, col]) => {
      // Check if the cell [row, col] is present in updatedOwnMinesList
      return updatedOppMinesList.some(
        ([mineRow, mineCol]) => mineRow === row && mineCol === col,
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
      sameTeamMessage: `Opponent sub received ${Math.ceil(
        (oppHits * 100) / process.env.STARTING_LIFE_SUPPORT,
      )}% damage!`,
      oppTeamMessage: `Your sub received ${Math.ceil(
        (oppHits * 100) / process.env.STARTING_LIFE_SUPPORT,
      )}% damage!`,
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
      sameTeamMessage: `Your sub received ${Math.ceil(
        (ownHits * 100) / process.env.STARTING_LIFE_SUPPORT,
      )}% damage!`,
      oppTeamMessage: `Opponent sub received ${Math.ceil(
        (ownHits * 100) / process.env.STARTING_LIFE_SUPPORT,
      )}% damage!`,
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
    process.env.MAX_MESSAGES,
  );

  syncNetworkMessage["gameStats"] = {
    ...gameStats,
    [team]: {
      ...gameStats[team],
      torpedoesLaunched: gameStats[team].torpedoesLaunched + 1,
    },
  }

  return syncNetworkMessage;
}

// First mate drops a mine
// MESSAGE: {row, column}
export function firstMateDropMine(context, message) {
  const { getMessagePlayer, networkState, getCellsDistanceAway } = context;

  const {
    systemChargeLevels,
    minesList,
    notificationMessages,
    messageTimestamp,
    currentlySurfacing,
    gameMap,
    systemHealthLevels,
    subLocations,
    gameStats,
  } = networkState;

  const team = getMessagePlayer(message).team;
  if (currentlySurfacing[team]) {
    return {};
  }

  // If the torpedo isn't fully charged, don't do anything
  if (
    systemChargeLevels[team].mine <
    SYSTEMS_INFO.find((system) => system.name === "mine").maxCharge
  ) {
    return {};
  }

  // If weapons are disabled, don't do anything
  if (systemHealthLevels[team].weapons < 1) {
    return {};
  }

  // If the cell isn't within range, don't do anything
  const possibleMineCells = getCellsDistanceAway(
    subLocations[team][0],
    subLocations[team][1],
    process.env.DROP_MINE_RANGE,
  );
  if (
    !possibleMineCells.find(
      (cell) => cell[0] === message.data.row && cell[1] === message.data.column,
    )
  ) {
    return {};
  }

  // If the cell is out of the map bounds, don't do anything
  if (
    message.data.column < 0 ||
    message.data.column >= process.env.MAP_DIMENSION ||
    message.data.row < 0 ||
    message.data.row >= process.env.MAP_DIMENSION
  ) {
    return {};
  }

  // If the cell is occupied by an island, don't do anything
  if (gameMap[message.data.row][message.data.column] === "island") {
    return {};
  }

  // If there's already a mine there, don't do anything
  if (gameMap[message.data.row][message.data.column].minePresent[team]) {
    return {};
  }

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
      message.data.column,
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
    process.env.MAX_MESSAGES,
  );
  syncNetworkMessage["minesList"] = {
    ...minesList,
    [team]: [...minesList[team], [message.data.row, message.data.column]],
  };

  syncNetworkMessage["gameStats"] = {
    ...gameStats,
    [team]: {
      ...gameStats[team],
      minesDropped: gameStats[team].minesDropped + 1,
    },
  };

  return syncNetworkMessage;
}

// First mate detonates a mine
// MESSAGE: {row, column}
export function firstMateDetonateMine(context, message) {
  const { getMessagePlayer, updateLifeSupport, networkState, detonateWeapon } =
    context;

  const {
    subLocations,
    systemHealthLevels,
    minesList,
    messageTimestamp,
    notificationMessages,
    currentlySurfacing,
    gameStats,
  } = networkState;

  let tempMessages = [];
  let tempTimestamp = messageTimestamp;

  // Define the teams
  const team = getMessagePlayer(message).team;
  const oppositeTeam = team === "blue" ? "red" : "blue";

  if (currentlySurfacing[team]) {
    return {};
  }

  // If there isn't a mine there, don't do anything
  if (
    !minesList[team].find(
      ([row, col]) => row === message.data.row && col === message.data.column,
    )
  ) {
    return {};
  }

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
      process.env.MAX_MINE_DAMAGE,
    );
    updatedOwnMinesList = ownMinesResult.listToUpdate;
    updatedDamageMap = ownMinesResult.updatedDamageMap;

    const oppMinesResult = detonateWeapon(
      oppMinesDetonated,
      updatedOppMinesList,
      updatedDamageMap,
      process.env.MAX_MINE_DAMAGE,
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
        ([mineRow, mineCol]) => mineRow === row && mineCol === col,
      );
    });

    // Check if any other mineIndices were detonated
    oppMinesDetonated = combinedHitCells.filter(([row, col]) => {
      // Check if the cell [row, col] is present in updatedOwnMinesList
      return updatedOppMinesList.some(
        ([mineRow, mineCol]) => mineRow === row && mineCol === col,
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
      sameTeamMessage: `Opponent sub received ${Math.ceil(
        (oppHits * 100) / process.env.STARTING_LIFE_SUPPORT,
      )}% damage!`,
      oppTeamMessage: `Your sub received ${Math.ceil(
        (oppHits * 100) / process.env.STARTING_LIFE_SUPPORT,
      )}% damage!`,
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
      sameTeamMessage: `Your sub received ${Math.ceil(
        (ownHits * 100) / process.env.STARTING_LIFE_SUPPORT,
      )}% damage!`,
      oppTeamMessage: `Opponent sub received ${Math.ceil(
        (ownHits * 100) / process.env.STARTING_LIFE_SUPPORT,
      )}% damage!`,
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
    process.env.MAX_MESSAGES,
  );

  syncNetworkMessage["gameStats"] = {
    ...gameStats,
    [team]: {
      ...gameStats[team],
      minesDetonated: gameStats[team].minesDetonated + 1,
    },
  }

  return syncNetworkMessage;
}

// First mate uses up their scan charge
// MESSAGE: {}
export function firstMateScan(context, message) {
  const { getMessagePlayer, networkState } = context;

  const {
    systemChargeLevels,
    messageTimestamp,
    notificationMessages,
    currentlySurfacing,
    gameStats,
  } = networkState;

  const team = getMessagePlayer(message).team;

  if (currentlySurfacing[team]) {
    return {};
  }

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
      process.env.MAX_MESSAGES,
    ),
    systemChargeLevels: {
      ...systemChargeLevels,
      [team]: {
        ...systemChargeLevels[team],
        probe: 0,
      },
    },
    gameStats: {
      ...gameStats,
      [team]: {
        ...gameStats[team],
        timesScanned: gameStats[team].timesScanned + 1,
      },
    }
  };
}

// Radio operator adds or removes a note from a cell
// MESSAGE: {row, column}
export function radioOperatorAddRemoveNote(context, message) {
  const { networkState, getMessagePlayer } = context;

  const { radioMapNotes, currentlySurfacing } = networkState;

  const team = getMessagePlayer(message).team;
  if (currentlySurfacing[team]) {
    return {};
  }

  const row = message.data.row;
  const column = message.data.column;
  if (
    row < 0 ||
    row >= process.env.MAP_DIMENSION ||
    column < 0 ||
    column >= process.env.MAP_DIMENSION
  ) {
    return {};
  }

  if (
    radioMapNotes[team].find((note) => note[0] === row && note[1] === column)
  ) {
    return {
      radioMapNotes: {
        ...radioMapNotes,
        [team]: radioMapNotes[team].filter(
          (note) => note[0] !== row || note[1] !== column,
        ),
      },
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
export function radioOperatorClearNotes(context, message) {
  const { networkState, getMessagePlayer } = context;

  const { radioMapNotes, currentlySurfacing } = networkState;

  const team = getMessagePlayer(message).team;
  if (currentlySurfacing[team]) {
    return {};
  }

  return {
    radioMapNotes: {
      ...radioMapNotes,
      [team]: [],
    },
  };
}

// Radio operator shifts all the notes in a direction
// MESSAGE: {direction}
export function radioOperatorShiftNotes(context, message) {
  const { networkState, getMessagePlayer } = context;

  const { radioMapNotes, currentlySurfacing } = networkState;

  const team = getMessagePlayer(message).team;
  if (currentlySurfacing[team]) {
    return {};
  }

  const direction = message.data.direction;

  if (!["north", "south", "east", "west"].includes(direction)) {
    return {};
  }
  if (
    direction === "north" &&
    radioMapNotes[team].some((note) => note[0] === 0)
  ) {
    return {};
  }
  if (
    direction === "south" &&
    radioMapNotes[team].some(
      (note) => note[0] === process.env.MAP_DIMENSION - 1,
    )
  ) {
    return {};
  }
  if (
    direction === "west" &&
    radioMapNotes[team].some((note) => note[1] === 0)
  ) {
    return {};
  }
  if (
    direction === "east" &&
    radioMapNotes[team].some(
      (note) => note[1] === process.env.MAP_DIMENSION - 1,
    )
  ) {
    return {};
  }

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

export function radioOperatorPlaceProbe(context, message){
  const { getMessagePlayer, networkState } = context;

  const {
    systemChargeLevels,
    messageTimestamp,
    currentlySurfacing,
    probes,
  } = networkState;

  const team = getMessagePlayer(message).team;

  if (currentlySurfacing[team]) {
    return {};
  }

  const row = message.data.row;
  const column = message.data.column;

  if (
    row < 0 ||
    row >= process.env.MAP_DIMENSION ||
    column < 0 ||
    column >= process.env.MAP_DIMENSION
  ) {
    return {};
  }

  let updatedProbes = {...probes}
  
  const probe = probes[team].find((note) => note[0] === row && note[1] === column)
  let probeChargeLevel;

  if (systemChargeLevels[team]["probe"] > 0) {
    if (probe) {
      probe[2] += 1;
      probeChargeLevel = Math.max(0, systemChargeLevels[team]["probe"] - 1);
    } else {
      if (systemChargeLevels[team]["probe"]< 2){
        return {};
      } else {
        updatedProbes = {
          ...updatedProbes,
          [team]: [...updatedProbes[team], [row, column, 1]],
        };
        probeChargeLevel = Math.max(0, systemChargeLevels[team]["probe"] - 2);
      }
    }
  } else {
    probeChargeLevel = systemChargeLevels[team]["probe"];
  }
  
  return {
    messageTimestamp: messageTimestamp + 1,
    systemChargeLevels: {
      ...systemChargeLevels,
      [team]: {
        ...systemChargeLevels[team],
        probe: probeChargeLevel,
      },
    },
    probes: updatedProbes
  };
}

export function syncNetworkState(context, networkStateSubset) {
  const { setNetworkState } = context;
  Object.keys(networkStateSubset).forEach((key) => {
    setNetworkState({ type: key, value: networkStateSubset[key] });
  });
}
