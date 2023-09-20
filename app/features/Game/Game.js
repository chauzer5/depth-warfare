import { useChannel, usePresence } from "@ably-labs/react-hooks";
import { useGameContext } from "../../state/game_state";
import TeamSelection from "../TeamSelection/TeamSelection";
import Countdown from "../Countdown/Countdown";
import StartingSpot from "../StartingSpot/StartingSpot";
import { useEffect, useState } from "react";
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
  radioOperatorAddRemoveNote,
  radioOperatorClearNotes,
  radioOperatorShiftNotes,
} from "../../state/message_handler";
import GameEnd from "../GameEnd/GameEnd";

export default function Game() {
  const {
    gameId,
    username,
    currentStage,
    resetMap,
    selfClientId,
    hostClientId,
  } = useGameContext();

  const gameContext = useGameContext();

  const [messagesList, setMessagesList] = useState([]);
  const [presenceData, updateStatus] = usePresence(`dw-${gameId}`, {
    name: username,
    team: null,
    role: null,
  });
  const [channel] = useChannel(`dw-${gameId}`, (message) => {
    setMessagesList((prev) => [...prev, { ...message }]);
  });

  useEffect(() => {
    resetMap();
  }, []);

  useEffect(() => {
    const newMessage = messagesList[messagesList.length - 1];

    let networkState = {};

    switch (newMessage?.name) {
      case "captain-set-starting-spot": // Done
        networkState = captainSetStartingSpot(gameContext, newMessage);
        syncNetworkState(gameContext, networkState);
        if (selfClientId === hostClientId) {
          channel.publish("sync-network-state", networkState);
        }
        break;
      case "captain-start-sub-navigate":
        networkState = captainStartSubNavigate(gameContext, newMessage);
        syncNetworkState(gameContext, networkState);
        if (selfClientId === hostClientId) {
          channel.publish("sync-network-state", networkState);
        }
        break;
      case "captain-cancel-sub-navigate":
        networkState = captainCancelSubNavigate(gameContext, newMessage);
        syncNetworkState(gameContext, networkState);
        if (selfClientId === hostClientId) {
          channel.publish("sync-network-state", networkState);
        }
        break;
      case "engineer-place-system-block":
        networkState = engineerPlaceSystemBlock(gameContext, newMessage);
        syncNetworkState(gameContext, networkState);
        if (selfClientId === hostClientId) {
          channel.publish("sync-network-state", networkState);
        }
        break;
      case "first-mate-choose-system-charge":
        networkState = firstMateChooseSystemCharge(gameContext, newMessage);
        syncNetworkState(gameContext, networkState);
        if (selfClientId === hostClientId) {
          channel.publish("sync-network-state", networkState);
        }
        break;
      case "captain-silence":
        networkState = captainSilence(gameContext, newMessage);
        syncNetworkState(gameContext, networkState);
        if (selfClientId === hostClientId) {
          channel.publish("sync-network-state", networkState);
        }
        break;
      case "captain-surface":
        networkState = captainSurface(gameContext, newMessage);
        syncNetworkState(gameContext, networkState);
        if (selfClientId === hostClientId) {
          channel.publish("sync-network-state", networkState);
        }
        break;
      case "stop-surfacing":
        networkState = stopSurfacing(gameContext, newMessage);
        syncNetworkState(gameContext, networkState);
        if (selfClientId === hostClientId) {
          channel.publish("sync-network-state", networkState);
        }
        break;
      case "first-mate-fire-torpedo":
        networkState = firstMateFireTorpedo(gameContext, newMessage);
        syncNetworkState(gameContext, networkState);
        if (selfClientId === hostClientId) {
          channel.publish("sync-network-state", networkState);
        }
        break;
      case "first-mate-drop-mine":
        networkState = firstMateDropMine(gameContext, newMessage);
        syncNetworkState(gameContext, networkState);
        if (selfClientId === hostClientId) {
          channel.publish("sync-network-state", networkState);
        }
        break;
      case "first-mate-detonate-mine":
        networkState = firstMateDetonateMine(gameContext, newMessage);
        syncNetworkState(gameContext, networkState);
        if (selfClientId === hostClientId) {
          channel.publish("sync-network-state", networkState);
        }
        break;
      case "first-mate-scan":
        networkState = firstMateScan(gameContext, newMessage);
        syncNetworkState(gameContext, networkState);
        if (selfClientId === hostClientId) {
          channel.publish("sync-network-state", networkState);
        }
        break;
      case "radio-operator-add-remove-note":
        networkState = radioOperatorAddRemoveNote(gameContext, newMessage);
        syncNetworkState(gameContext, networkState);
        if (selfClientId === hostClientId) {
          channel.publish("sync-network-state", networkState);
        }
        break;
      case "radio-operator-clear-notes":
        networkState = radioOperatorClearNotes(gameContext, newMessage);
        syncNetworkState(gameContext, networkState);
        if (selfClientId === hostClientId) {
          channel.publish("sync-network-state", networkState);
        }
        break;
      case "radio-operator-shift-notes":
        networkState = radioOperatorShiftNotes(gameContext, newMessage);
        syncNetworkState(gameContext, networkState);
        if (selfClientId === hostClientId) {
          channel.publish("sync-network-state", networkState);
        }
        break;
      case "sync-network-state":
        // Do nothing
        networkState = newMessage.data;
        syncNetworkState(gameContext, networkState);
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
          channel={channel}
        />
      ) : currentStage === "starting-spot" ? (
        <StartingSpot channel={channel} />
      ) : currentStage === "countdown" ? (
        <Countdown />
      ) : currentStage === "main" ? (
        <PlayerDashboard channel={channel} />
      ) : currentStage === "game-end" ? (
        <GameEnd />
      ) : null}
    </>
  );
}
