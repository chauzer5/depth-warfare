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
// MESSAGE: {system}
export function engineerChooseSystemDamage(context, message){
  const {
    pendingNavigate,
    setPendingNavigate,
    pendingSystemDamage,
    setPendingSystemDamage,
    pendingSystemCharge,
    setPendingSystemCharge,
    systemChargeLevels,
    setSystemChargeLevels,
    getMessagePlayer,
    moveSubDirection,
    setSystemHealthLevels,
    systemHealthLevels,
    enemyMovements,
    setEnemyMovements,
    playerTeam,
  } = context;

  const team = getMessagePlayer(message).team;

  if (!pendingSystemCharge[team]) {
    setPendingSystemDamage({ ...pendingSystemDamage, [team]: message.data.system });
  }
  else {
    // charge the specified system
    setSystemChargeLevels({
      ...systemChargeLevels,
      [team]: {
        ...systemChargeLevels[team],
        [pendingSystemCharge[team]]: systemChargeLevels[team][pendingSystemCharge[team]] + 1,
      },
    });

    // damage the specified system
    setSystemHealthLevels({
      ...systemHealthLevels,
      [team]: {
        ...systemHealthLevels[team],
        [message.data.system]: systemHealthLevels[team][message.data.system] - process.env.SYSTEM_DAMAGE_AMOUNT,
      },
    });

    // move the sub in the specified direction
    moveSubDirection(team, pendingNavigate[team]);
    if(playerTeam !== team){
      setEnemyMovements([...enemyMovements, pendingNavigate[team]]);
    }

    // reset the pending state
    setPendingSystemCharge({ ...pendingSystemCharge, [team]: null });
    setPendingSystemDamage({ ...pendingSystemDamage, [team]: null });
    setPendingNavigate({ ...pendingNavigate, [team]: null });
  }
}

// first make choses something to activate
// MESSAGE: {system}
export function firstMateChooseSystemCharge(context, message){
  const {
    pendingNavigate,
    setPendingNavigate,
    pendingSystemDamage,
    setPendingSystemDamage,
    pendingSystemCharge,
    setPendingSystemCharge,
    systemChargeLevels,
    setSystemChargeLevels,
    getMessagePlayer,
    moveSubDirection,
    setSystemHealthLevels,
    systemHealthLevels,
    enemyMovements,
    setEnemyMovements,
    playerTeam,
  } = context;

  const team = getMessagePlayer(message).team;

  if (!pendingSystemDamage[team]) {
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

    // damage the specified system
    setSystemHealthLevels({
      ...systemHealthLevels,
      [team]: {
        ...systemHealthLevels[team],
        [pendingSystemDamage[team]]: systemHealthLevels[team][pendingSystemDamage[team]] - process.env.SYSTEM_DAMAGE_AMOUNT,
      },
    });

    // move the sub in the specified direction
    moveSubDirection(team, pendingNavigate[team]);
    if(playerTeam !== team){
      setEnemyMovements([...enemyMovements, pendingNavigate[team]]);
    }

    // reset the pending state
    setPendingSystemDamage({ ...pendingSystemDamage, [team]: null });
    setPendingSystemCharge({ ...pendingSystemCharge, [team]: null });
    setPendingNavigate({ ...pendingNavigate, [team]: null });
  }
}

//Captain can change his mind on a move he makes
// MESSAGE: {}
export function captainCancelSubNavigate(context, message){
  const {
    pendingNavigate,
    setPendingNavigate,
    pendingSystemDamage,
    setPendingSystemDamage,
    pendingSystemCharge,
    setPendingSystemCharge,
    getMessagePlayer,
  } = context;

  const team = getMessagePlayer(message).team;

  setPendingNavigate({ ...pendingNavigate, [team]: null });
  setPendingSystemDamage({ ...pendingSystemDamage, [team]: null });
  setPendingSystemCharge({ ...pendingSystemCharge, [team]: null });
}
