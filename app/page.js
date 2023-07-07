"use client";

import { useGameContext } from "./context/game_state";
import Lobby from "./features/Lobby/Lobby";
import Login from "./features/Login/Login";
import Game from "./features/Game/Game";

export default function App() {

  const { currentStage } = useGameContext();

  return (
      <>
        {currentStage === "login" ? <Login /> :
         currentStage === "lobby" ? <Lobby /> :
         <Game />
        }
      </>
  );
}
