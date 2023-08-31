"use client";

import { useGameContext } from "./state/game_state";
import Lobby from "./features/Lobby/Lobby";
import Login from "./features/Login/Login";
import Game from "./features/Game/Game";
import { Alert, Snackbar } from "@mui/material";

export default function App() {

  const {
    currentStage,
    notificationOpen,
    notificationSeverity,
    notificationMessage,
    closeNotify,
  } = useGameContext();

  return (
    <>
      {
        currentStage === "login" ? <Login /> :
        currentStage === "lobby" ? <Lobby /> :
        <Game />
      }

      <Snackbar open={notificationOpen} autoHideDuration={8000} onClose={closeNotify}>
        <Alert severity={notificationSeverity}>
          {notificationMessage}
        </Alert>
      </Snackbar>
    </>
  );
}
