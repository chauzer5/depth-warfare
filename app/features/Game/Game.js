import { useChannel, usePresence } from "@ably-labs/react-hooks";
import { useGameContext } from "../../state/game_state";
import TeamSelection from "../TeamSelection/TeamSelection";
import Countdown from "../Countdown/Countdown";
import StartingSpot from "../StartingSpot/StartingSpot";
import { useEffect, useState, useRef } from "react";
import PlayerDashboard from "../PlayerDashboard/PlayerDashboard";
import {
  captainCancelSubNavigate,
  captainSetStartingSpot,
  captainSilence,
  captainStartSubNavigate,
  firstMateScan,
  engineerPlaceSystemBlock,
  captainSurface,
  firstMateChooseSystemCharge,
  firstMateFireTorpedo,
  firstMateDropMine,
  firstMateDetonateMine,
  syncNetworkState,
  stopSurfacing,
  engineerClearRepairMatrix,
  radioOperatorAddRemoveNote,
  radioOperatorClearNotes,
  radioOperatorShiftNotes,
} from "../../state/message_handler";
import GameEnd from "../GameEnd/GameEnd";
import { useAblyContext } from "@/app/state/ably_state";

export default function Game() {
  const {
    gameId,
    username,
    currentStage,
    hostClientId,
    subLocations,
    gameMap,
    systemChargeLevels,
    movementCountOnDisable,
    systemHealthLevels,
    engineerCompassMap,
    movements,
    pendingSystemCharge,
    engineerPendingBlock,
    pendingNavigate,
    engineerHealSystem,
    notificationMessages,
    messageTimestamp,
    currentlySurfacing,
    minesList,
    radioMapNotes,
    repairMatrix,
    randomEnabledDirection,
  } = useGameContext();

  const gameContext = useGameContext();
  const { selfClientId, channel, setChannel } = useAblyContext();

  const [messagesList, setMessagesList] = useState([]);
  const [presenceData, updateStatus] = usePresence(`dw-${gameId}`, {
    name: username,
    team: null,
    role: null,
  });
  const [gameChannel] = useChannel(`dw-${gameId}`, (message) => {
    setMessagesList((prev) => [...prev, { ...message }]);
  });

  useEffect(() => {
    setChannel(gameChannel);
  }, [gameChannel]);

  const completeStateRef = useRef({
    currentStage,
    subLocations,
    gameMap,
    systemChargeLevels,
    movementCountOnDisable,
    systemHealthLevels,
    engineerCompassMap,
    movements,
    pendingSystemCharge,
    engineerPendingBlock,
    pendingNavigate,
    engineerHealSystem,
    notificationMessages,
    messageTimestamp,
    currentlySurfacing,
    minesList,
    radioMapNotes,
    repairMatrix,
    randomEnabledDirection,
  });

  useEffect(() => {
    completeStateRef.current = {
      currentStage,
      subLocations,
      gameMap,
      systemChargeLevels,
      movementCountOnDisable,
      systemHealthLevels,
      engineerCompassMap,
      movements,
      pendingSystemCharge,
      engineerPendingBlock,
      pendingNavigate,
      engineerHealSystem,
      notificationMessages,
      messageTimestamp,
      currentlySurfacing,
      minesList,
      radioMapNotes,
      repairMatrix,
      randomEnabledDirection,
    };
  }, [
    currentStage,
    subLocations,
    gameMap,
    systemChargeLevels,
    movementCountOnDisable,
    systemHealthLevels,
    engineerCompassMap,
    movements,
    pendingSystemCharge,
    engineerPendingBlock,
    pendingNavigate,
    engineerHealSystem,
    notificationMessages,
    messageTimestamp,
    currentlySurfacing,
    minesList,
    radioMapNotes,
    repairMatrix,
    randomEnabledDirection,
    selfClientId,
    hostClientId,
  ]);

  useEffect(() => {
    const newMessage = messagesList[messagesList.length - 1];

    let networkState = {};

    switch (newMessage?.name) {
      case "captain-set-starting-spot": // Done
        if (selfClientId === hostClientId) {
          networkState = captainSetStartingSpot(gameContext, newMessage);
          syncNetworkState(gameContext, networkState);
          channel.publish(
            "sync-network-state",
            Object.assign(completeStateRef.current, networkState),
          );
        }
        break;
      case "captain-start-sub-navigate":
        if (selfClientId === hostClientId) {
          networkState = captainStartSubNavigate(gameContext, newMessage);
          syncNetworkState(gameContext, networkState);
          channel.publish(
            "sync-network-state",
            Object.assign(completeStateRef.current, networkState),
          );
        }
        break;
      case "captain-cancel-sub-navigate":
        if (selfClientId === hostClientId) {
          networkState = captainCancelSubNavigate(gameContext, newMessage);
          syncNetworkState(gameContext, networkState);
          channel.publish(
            "sync-network-state",
            Object.assign(completeStateRef.current, networkState),
          );
        }
        break;
      case "engineer-place-system-block":
        if (selfClientId === hostClientId) {
          networkState = engineerPlaceSystemBlock(gameContext, newMessage);
          syncNetworkState(gameContext, networkState);
          channel.publish(
            "sync-network-state",
            Object.assign(completeStateRef.current, networkState),
          );
        }
        break;
      case "engineer-clear-repair-matrix":
        if (selfClientId === hostClientId) {
          networkState = engineerClearRepairMatrix(gameContext, newMessage);
          syncNetworkState(gameContext, networkState);
          channel.publish(
            "sync-network-state",
            Object.assign(completeStateRef.current, networkState),
          );
        }
        break;
      case "first-mate-choose-system-charge":
        if (selfClientId === hostClientId) {
          networkState = firstMateChooseSystemCharge(gameContext, newMessage);
          syncNetworkState(gameContext, networkState);
          channel.publish(
            "sync-network-state",
            Object.assign(completeStateRef.current, networkState),
          );
        }
        break;
      case "captain-silence":
        if (selfClientId === hostClientId) {
          networkState = captainSilence(gameContext, newMessage);
          syncNetworkState(gameContext, networkState);
          channel.publish(
            "sync-network-state",
            Object.assign(completeStateRef.current, networkState),
          );
        }
        break;
      case "captain-surface":
        if (selfClientId === hostClientId) {
          networkState = captainSurface(gameContext, newMessage);
          syncNetworkState(gameContext, networkState);
          channel.publish(
            "sync-network-state",
            Object.assign(completeStateRef.current, networkState),
          );
        }
        break;
      case "stop-surfacing":
        if (selfClientId === hostClientId) {
          networkState = stopSurfacing(gameContext, newMessage);
          syncNetworkState(gameContext, networkState);
          channel.publish(
            "sync-network-state",
            Object.assign(completeStateRef.current, networkState),
          );
        }
        break;
      case "first-mate-fire-torpedo":
        if (selfClientId === hostClientId) {
          networkState = firstMateFireTorpedo(gameContext, newMessage);
          syncNetworkState(gameContext, networkState);
          channel.publish(
            "sync-network-state",
            Object.assign(completeStateRef.current, networkState),
          );
        }
        break;
      case "first-mate-drop-mine":
        if (selfClientId === hostClientId) {
          networkState = firstMateDropMine(gameContext, newMessage);
          syncNetworkState(gameContext, networkState);
          channel.publish(
            "sync-network-state",
            Object.assign(completeStateRef.current, networkState),
          );
        }
        break;
      case "first-mate-detonate-mine":
        if (selfClientId === hostClientId) {
          networkState = firstMateDetonateMine(gameContext, newMessage);
          syncNetworkState(gameContext, networkState);
          channel.publish(
            "sync-network-state",
            Object.assign(completeStateRef.current, networkState),
          );
        }
        break;
      case "first-mate-scan":
        if (selfClientId === hostClientId) {
          networkState = firstMateScan(gameContext, newMessage);
          syncNetworkState(gameContext, networkState);
          channel.publish(
            "sync-network-state",
            Object.assign(completeStateRef.current, networkState),
          );
        }
        break;
      case "radio-operator-add-remove-note":
        if (selfClientId === hostClientId) {
          networkState = radioOperatorAddRemoveNote(gameContext, newMessage);
          syncNetworkState(gameContext, networkState);
          channel.publish(
            "sync-network-state",
            Object.assign(completeStateRef.current, networkState),
          );
        }
        break;
      case "radio-operator-clear-notes":
        if (selfClientId === hostClientId) {
          networkState = radioOperatorClearNotes(gameContext, newMessage);
          syncNetworkState(gameContext, networkState);
          channel.publish(
            "sync-network-state",
            Object.assign(completeStateRef.current, networkState),
          );
        }
        break;
      case "radio-operator-shift-notes":
        if (selfClientId === hostClientId) {
          networkState = radioOperatorShiftNotes(gameContext, newMessage);
          syncNetworkState(gameContext, networkState);
          channel.publish(
            "sync-network-state",
            Object.assign(completeStateRef.current, networkState),
          );
        }
        break;
      case "sync-network-state":
        if (
          (!(selfClientId === hostClientId) && currentStage == "main") ||
          currentStage != "main"
        ) {
          networkState = newMessage.data;
          syncNetworkState(gameContext, networkState);
        }
        break;
      default:
        console.error(`Unrecognized message type: ${newMessage?.name}}`);
    }
  }, [messagesList]);

  return (
    <>
      {currentStage === "teams" ? (
        <TeamSelection
          presenceData={presenceData}
          updateStatus={updateStatus}
        />
      ) : currentStage === "starting-spot" ? (
        <StartingSpot />
      ) : currentStage === "countdown" ? (
        <Countdown />
      ) : currentStage === "main" ? (
        <PlayerDashboard />
      ) : currentStage === "game-end" ? (
        <GameEnd />
      ) : null}
    </>
  );
}
