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
    hostClientId,
    networkState
  } = useGameContext();

  const { currentStage } = networkState

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

  const networkStateRef = useRef(networkState);

  useEffect(() => {
    networkStateRef.current = networkState;
  }, [networkState]);

  useEffect(() => {
    const newMessage = messagesList[messagesList.length - 1];

    let networkStateSubset = {};

    switch (newMessage?.name) {
      case "captain-set-starting-spot": // Done
        if (selfClientId === hostClientId) {
          networkStateSubset = captainSetStartingSpot(gameContext, newMessage);
          syncNetworkState(gameContext, networkStateSubset);
          channel.publish(
            "sync-network-state",
            Object.assign(networkStateRef.current, networkStateSubset),
          );
        }
        break;
      case "captain-start-sub-navigate":
        if (selfClientId === hostClientId) {
          networkStateSubset = captainStartSubNavigate(gameContext, newMessage);
          syncNetworkState(gameContext, networkStateSubset);
          channel.publish(
            "sync-network-state",
            Object.assign(networkStateRef.current, networkStateSubset),
          );
        }
        break;
      case "captain-cancel-sub-navigate":
        if (selfClientId === hostClientId) {
          networkStateSubset = captainCancelSubNavigate(gameContext, newMessage);
          syncNetworkState(gameContext, networkStateSubset);
          channel.publish(
            "sync-network-state",
            Object.assign(networkStateRef.current, networkStateSubset),
          );
        }
        break;
      case "engineer-place-system-block":
        if (selfClientId === hostClientId) {
          networkStateSubset = engineerPlaceSystemBlock(gameContext, newMessage);
          syncNetworkState(gameContext, networkStateSubset);
          channel.publish(
            "sync-network-state",
            Object.assign(networkStateRef.current, networkStateSubset),
          );
        }
        break;
      case "engineer-clear-repair-matrix":
        if (selfClientId === hostClientId) {
          networkStateSubset = engineerClearRepairMatrix(gameContext, newMessage);
          syncNetworkState(gameContext, networkStateSubset);
          channel.publish(
            "sync-network-state",
            Object.assign(networkStateRef.current, networkStateSubset),
          );
        }
        break;
      case "first-mate-choose-system-charge":
        if (selfClientId === hostClientId) {
          networkStateSubset = firstMateChooseSystemCharge(gameContext, newMessage);
          syncNetworkState(gameContext, networkStateSubset);
          channel.publish(
            "sync-network-state",
            Object.assign(networkStateRef.current, networkStateSubset),
          );
        }
        break;
      case "captain-silence":
        if (selfClientId === hostClientId) {
          networkStateSubset = captainSilence(gameContext, newMessage);
          syncNetworkState(gameContext, networkStateSubset);
          channel.publish(
            "sync-network-state",
            Object.assign(networkStateRef.current, networkStateSubset),
          );
        }
        break;
      case "captain-surface":
        if (selfClientId === hostClientId) {
          networkStateSubset = captainSurface(gameContext, newMessage);
          syncNetworkState(gameContext, networkStateSubset);
          channel.publish(
            "sync-network-state",
            Object.assign(networkStateRef.current, networkStateSubset),
          );
        }
        break;
      case "stop-surfacing":
        if (selfClientId === hostClientId) {
          networkStateSubset = stopSurfacing(gameContext, newMessage);
          syncNetworkState(gameContext, networkStateSubset);
          channel.publish(
            "sync-network-state",
            Object.assign(networkStateRef.current, networkStateSubset),
          );
        }
        break;
      case "first-mate-fire-torpedo":
        if (selfClientId === hostClientId) {
          networkStateSubset = firstMateFireTorpedo(gameContext, newMessage);
          syncNetworkState(gameContext, networkStateSubset);
          channel.publish(
            "sync-network-state",
            Object.assign(networkStateRef.current, networkStateSubset),
          );
        }
        break;
      case "first-mate-drop-mine":
        if (selfClientId === hostClientId) {
          networkStateSubset = firstMateDropMine(gameContext, newMessage);
          syncNetworkState(gameContext, networkStateSubset);
          channel.publish(
            "sync-network-state",
            Object.assign(networkStateRef.current, networkStateSubset),
          );
        }
        break;
      case "first-mate-detonate-mine":
        if (selfClientId === hostClientId) {
          networkStateSubset = firstMateDetonateMine(gameContext, newMessage);
          syncNetworkState(gameContext, networkStateSubset);
          channel.publish(
            "sync-network-state",
            Object.assign(networkStateRef.current, networkStateSubset),
          );
        }
        break;
      case "first-mate-scan":
        if (selfClientId === hostClientId) {
          networkStateSubset = firstMateScan(gameContext, newMessage);
          syncNetworkState(gameContext, networkStateSubset);
          channel.publish(
            "sync-network-state",
            Object.assign(networkStateRef.current, networkStateSubset),
          );
        }
        break;
      case "radio-operator-add-remove-note":
        if (selfClientId === hostClientId) {
          networkStateSubset = radioOperatorAddRemoveNote(gameContext, newMessage);
          syncNetworkState(gameContext, networkStateSubset);
          channel.publish(
            "sync-network-state",
            Object.assign(networkStateRef.current, networkStateSubset),
          );
        }
        break;
      case "radio-operator-clear-notes":
        if (selfClientId === hostClientId) {
          networkStateSubset = radioOperatorClearNotes(gameContext, newMessage);
          syncNetworkState(gameContext, networkStateSubset);
          channel.publish(
            "sync-network-state",
            Object.assign(networkStateRef.current, networkStateSubset),
          );
        }
        break;
      case "radio-operator-shift-notes":
        if (selfClientId === hostClientId) {
          networkStateSubset = radioOperatorShiftNotes(gameContext, newMessage);
          syncNetworkState(gameContext, networkStateSubset);
          channel.publish(
            "sync-network-state",
            Object.assign(networkStateRef.current, networkStateSubset),
          );
        }
        break;
      case "sync-network-state":
        if (
          (!(selfClientId === hostClientId) && currentStage == "main") ||
          currentStage != "main"
        ) {
          networkStateSubset = newMessage.data;
          syncNetworkState(gameContext, networkStateSubset);
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
