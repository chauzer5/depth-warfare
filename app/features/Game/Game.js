import { useChannel, usePresence } from "@ably-labs/react-hooks";
import { useGameContext } from "../../state/game_state";
import TeamSelection from "../TeamSelection/TeamSelection";
import Countdown from "../Countdown/Countdown";
import StartingSpot from "../StartingSpot/StartingSpot";
import { useEffect, useState } from "react";
import PlayerDashboard from "../PlayerDashboard/PlayerDashboard";
import { captainCancelSubNavigate, captainSetStartingSpot, 
  captainSilence, captainStartSubNavigate,
  engineerChooseSystemDamage, engineerPlaceSystemBlock, 
  firstMateChooseSystemCharge, engineerClearSystems, firstMateFireTorpedo } from "../../state/message_handler";

export default function Game() {
  const {
    gameId,
    username,
    currentStage,
    resetMap,
    getEmptyRepairMatrix,
    setRepairMatrix,
  } = useGameContext();

  const gameContext = useGameContext();

  const [messagesList, setMessagesList] = useState([]);
  const [presenceData, updateStatus] = usePresence(`dw-${gameId}`, {name: username, team: null, role: null});
  const [channel] = useChannel(`dw-${gameId}`, (message) => {
    setMessagesList((prev) => [...prev, {...message}]);
  });

  useEffect(() => {
    resetMap();
    const emptyRepairMatrixBlue = getEmptyRepairMatrix();
    const emptyRepairMatrixRed = getEmptyRepairMatrix();
    const newRepairMatrix = {blue: emptyRepairMatrixBlue, red: emptyRepairMatrixRed}
    setRepairMatrix(newRepairMatrix)
  }, []);

  useEffect(() => {
    const newMessage = messagesList[messagesList.length - 1];
    console.log("NEW MESSAGE RECEIVED");
    console.log(newMessage);

    switch(newMessage?.name){
      case "captain-set-starting-spot":
        captainSetStartingSpot(gameContext, newMessage);
        break;
      case "captain-start-sub-navigate":
        captainStartSubNavigate(gameContext, newMessage);
        break;
      case "captain-cancel-sub-navigate":
        captainCancelSubNavigate(gameContext, newMessage);
        break;
      // case "engineer-choose-system-damage":
      //   engineerChooseSystemDamage(gameContext, newMessage);
      //   break;
      case "engineer-place-system-block":
        engineerPlaceSystemBlock(gameContext, newMessage);
        break;
      case "engineer-clear-systems":
        engineerClearSystems(gameContext, newMessage);
        break;
      case "first-mate-choose-system-charge":
        firstMateChooseSystemCharge(gameContext, newMessage);
        break;
      case "captain-silence":
        captainSilence(gameContext, newMessage);
        break;
      case "captain-surface":
        captainSurface(gameContext, newMessage);
        break;
      case "first-mate-fire-torpedo":
        firstMateFireTorpedo(gameContext, newMessage);
        break;
      case "first-mate-drop-mine":
        firstMateDropMine(gameContext, newMessage);
        break;
      case "first-mate-detonate-mine":
        firstMateDetonateMine(gameContext, newMessage);
        break;
      case "first-mate-scan":
        firstMateScan(gameContext, newMessage);
        break;
      default:
        console.log(`Unrecognized message type: ${newMessage?.name}}`);
    }

  }, [messagesList])

  return (
    <>
      {
        currentStage === "teams" ? <TeamSelection presenceData={presenceData} updateStatus={updateStatus} channel={channel}/> :
        currentStage === "starting-spot" ? <StartingSpot channel={channel} /> :
        currentStage === "countdown" ? <Countdown /> :
        currentStage === "main" ? <PlayerDashboard channel={channel}/> :
        null
      }
    </>
  );
}