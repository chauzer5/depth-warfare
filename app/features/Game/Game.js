import { useChannel, usePresence } from "@ably-labs/react-hooks";
import { useGameContext } from "../../state/game_state";
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
  radioOperatorPlaceProbe,
} from "../../state/message_handler";
import GameEnd from "../GameEnd/GameEnd";
import { useAblyContext } from "@/app/state/ably_state";
import {
  deleteSupabaseRow,
  insertSupabaseRow,
  updateSupabaseRow,
} from "@/app/state/supabase_access";

export default function Game() {
  const {
    gameId,
    username,
    hostClientId,
    networkState,
    setHostClientId,
    resetMap,
    getEmptyRepairMatrix,
    calculateMaxSystemHealth,
    setPlayerData,
    playerTeam,
    playerRole,
  } = useGameContext();

  const { currentStage, systemHealthLevels } = networkState;

  const gameContext = useGameContext();
  const { roomCode } = gameContext;
  const { selfClientId, channel, setChannel, supabase } = useAblyContext();

  const [messagesList, setMessagesList] = useState([]);
  const [presenceData, updateStatus] = usePresence(`dw-${gameId}`, {
    name: username,
    team: playerTeam,
    role: playerRole,
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
    if (presenceData.length != process.env.NUM_REQUIRED_PLAYERS) {
      return;
    }

    if (networkState.gameMap != null) {
      return;
    }

    const newPlayerData = presenceData.map((player) => {
      return {
        username: player.data.name,
        clientId: player.clientId,
        team: player.data.team,
        role: player.data.role,
      };
    });
    setPlayerData(newPlayerData);

    const hostClientId = presenceData.toSorted((a, b) =>
      a.clientId.localeCompare(b.clientId),
    )[0].clientId;
    setHostClientId(hostClientId);

    if (selfClientId === hostClientId) {
      const newMap = resetMap();
      const redRepairMatrix = getEmptyRepairMatrix();
      const blueRepairMatrix = getEmptyRepairMatrix();
      const newRepairMatrix = {
        red: redRepairMatrix,
        blue: blueRepairMatrix,
      };
      const newSystemHealthLevels = {
        blue: {
          weapons: calculateMaxSystemHealth(blueRepairMatrix, "weapons"),
          probe: calculateMaxSystemHealth(blueRepairMatrix, "probe"),
          engine: calculateMaxSystemHealth(blueRepairMatrix, "engine"),
          comms: calculateMaxSystemHealth(blueRepairMatrix, "comms"),
          "life support": systemHealthLevels["blue"]["life support"],
        },
        red: {
          weapons: calculateMaxSystemHealth(redRepairMatrix, "weapons"),
          probe: calculateMaxSystemHealth(redRepairMatrix, "probe"),
          engine: calculateMaxSystemHealth(redRepairMatrix, "engine"),
          comms: calculateMaxSystemHealth(redRepairMatrix, "comms"),
          "life support": systemHealthLevels["red"]["life support"],
        },
      };
      const networkStateSubset = {
        gameMap: newMap,
        repairMatrix: newRepairMatrix,
        systemHealthLevels: newSystemHealthLevels,
      };
      channel.publish("sync-network-state", networkStateSubset);

      const blue_captain = newPlayerData.find(
        (player) => player.team === "blue" && player.role === "captain",
      );
      const red_captain = newPlayerData.find(
        (player) => player.team === "red" && player.role === "captain",
      );
      const blue_first_mate = newPlayerData.find(
        (player) => player.team === "blue" && player.role === "first-mate",
      );
      const red_first_mate = newPlayerData.find(
        (player) => player.team === "red" && player.role === "first-mate",
      );
      const blue_engineer = newPlayerData.find(
        (player) => player.team === "blue" && player.role === "engineer",
      );
      const red_engineer = newPlayerData.find(
        (player) => player.team === "red" && player.role === "engineer",
      );
      const blue_radio_operator = newPlayerData.find(
        (player) => player.team === "blue" && player.role === "radio-operator",
      );
      const red_radio_operator = newPlayerData.find(
        (player) => player.team === "red" && player.role === "radio-operator",
      );

      // Update database
      insertSupabaseRow(supabase, {
        channel_id: gameId, // Set your channel ID here
        room_code: roomCode, // Set your room code here
        blue_captain: blue_captain?.username, // Set blue captain
        red_captain: red_captain?.username, // Set red captain
        blue_first_mate: blue_first_mate?.username, // Set blue first mate
        red_first_mate: red_first_mate?.username, // Set red first mate
        blue_engineer: blue_engineer?.username, // Set blue engineer
        red_engineer: red_engineer?.username, // Set red engineer
        blue_radio_operator: blue_radio_operator?.username, // Set blue radio operator
        red_radio_operator: red_radio_operator?.username, // Set red radio operator
      });
    }
  }, [presenceData]);

  useEffect(() => {
    if (networkState.gameMap === null) {
      return;
    }

    const newPlayerData = presenceData.map((player) => {
      return {
        username: player.data.name,
        clientId: player.clientId,
        team: player.data.team,
        role: player.data.role,
      };
    });

    const blue_captain = newPlayerData.find(
      (player) => player.team === "blue" && player.role === "captain",
    );
    const red_captain = newPlayerData.find(
      (player) => player.team === "red" && player.role === "captain",
    );
    const blue_first_mate = newPlayerData.find(
      (player) => player.team === "blue" && player.role === "first-mate",
    );
    const red_first_mate = newPlayerData.find(
      (player) => player.team === "red" && player.role === "first-mate",
    );
    const blue_engineer = newPlayerData.find(
      (player) => player.team === "blue" && player.role === "engineer",
    );
    const red_engineer = newPlayerData.find(
      (player) => player.team === "red" && player.role === "engineer",
    );
    const blue_radio_operator = newPlayerData.find(
      (player) => player.team === "blue" && player.role === "radio-operator",
    );
    const red_radio_operator = newPlayerData.find(
      (player) => player.team === "red" && player.role === "radio-operator",
    );

    setPlayerData(newPlayerData);

    if (selfClientId === hostClientId) {
      // Sync network data
      channel.publish("sync-network-state", networkStateRef.current);
    }

    const newHostClientId = presenceData.toSorted((a, b) =>
      a.clientId.localeCompare(b.clientId),
    )[0].clientId;
    setHostClientId(newHostClientId);

    if (presenceData.length === 1) {
      deleteSupabaseRow(supabase, roomCode);
    }

    // Update database
    if (selfClientId === newHostClientId) {
      updateSupabaseRow(supabase, roomCode, {
        blue_captain: blue_captain ? blue_captain.username : null, // Set blue captain
        red_captain: red_captain ? red_captain.username : null, // Set red captain
        blue_first_mate: blue_first_mate ? blue_first_mate.username : null, // Set blue first mate
        red_first_mate: red_first_mate ? red_first_mate.username : null, // Set red first mate
        blue_engineer: blue_engineer ? blue_engineer.username : null, // Set blue engineer
        red_engineer: red_engineer ? red_engineer.username : null, // Set red engineer
        blue_radio_operator: blue_radio_operator
          ? blue_radio_operator.username
          : null, // Set blue radio operator
        red_radio_operator: red_radio_operator
          ? red_radio_operator.username
          : null, // Set red radio operator
      });
    }
  }, [presenceData]);

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
          networkStateSubset = captainCancelSubNavigate(
            gameContext,
            newMessage,
          );
          syncNetworkState(gameContext, networkStateSubset);
          channel.publish(
            "sync-network-state",
            Object.assign(networkStateRef.current, networkStateSubset),
          );
        }
        break;
      case "engineer-place-system-block":
        if (selfClientId === hostClientId) {
          networkStateSubset = engineerPlaceSystemBlock(
            gameContext,
            newMessage,
          );
          syncNetworkState(gameContext, networkStateSubset);
          channel.publish(
            "sync-network-state",
            Object.assign(networkStateRef.current, networkStateSubset),
          );
        }
        break;
      case "engineer-clear-repair-matrix":
        if (selfClientId === hostClientId) {
          networkStateSubset = engineerClearRepairMatrix(
            gameContext,
            newMessage,
          );
          syncNetworkState(gameContext, networkStateSubset);
          channel.publish(
            "sync-network-state",
            Object.assign(networkStateRef.current, networkStateSubset),
          );
        }
        break;
      case "first-mate-choose-system-charge":
        if (selfClientId === hostClientId) {
          networkStateSubset = firstMateChooseSystemCharge(
            gameContext,
            newMessage,
          );
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
          networkStateSubset = radioOperatorAddRemoveNote(
            gameContext,
            newMessage,
          );
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
      case "radio-operator-place-probe":
        if (selfClientId === hostClientId) {
          networkStateSubset = radioOperatorPlaceProbe(gameContext, newMessage);
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
      {currentStage === "starting-spot" ? (
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
