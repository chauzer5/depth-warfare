"use client";

import { useGameContext } from "./context/game_state";
import Lobby from "./routes/Lobby";
import Login from "./routes/Login";
import Game from "./routes/Game";

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
