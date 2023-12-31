import { useAblyContext } from "@/app/state/ably_state";
import { useGameContext } from "@/app/state/game_state";
import { deleteSupabaseRow } from "@/app/state/supabase_access";
import { useEffect } from "react";
import TeamStats from "./TeamStats";

export default function GameEnd() {
  const styles = {
    main: {
      width: "100%",
      height: "100vh",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
    },
  };

  const { networkState, playerTeam, hostClientId } = useGameContext();
  const { supabase, selfClientId } = useAblyContext();
  const { systemHealthLevels } = networkState;

  useEffect(() => {
    // delete the room from supabase
    if (hostClientId === selfClientId) {
      deleteSupabaseRow(supabase, networkState.roomCode);
    }
  }, []);

  const teamDead = systemHealthLevels[playerTeam]["life support"] <= 0;
  const enemyTeamDead =
    systemHealthLevels[playerTeam === "red" ? "blue" : "red"]["life support"] <=
    0;

  const getEndGameMessage = () => {
    if (teamDead && enemyTeamDead) {
      return (
        <>
          <p>
            {"Both subs were destroyed in the same explosion at the same time."}
          </p>
          <p>{"The result is a draw."}</p>
        </>
      );
    } else if (enemyTeamDead) {
      return (
        <>
          <p>{"You destroyed the enemy sub and won."}</p>
          <p>{"Congratulations for this outstanding achievement."}</p>
          <p>
            {"We're sure we'll see even greater things from you in the future."}
          </p>
        </>
      );
    } else {
      return (
        <>
          <p>{"The enemy team destroyed your sub and you lost."}</p>
          <p>{"We expect to see better results from you next time."}</p>
        </>
      );
    }
  }
  

  return (
    <div style={styles.main}>
      {getEndGameMessage()}
      <div style={{
        display: "flex",
        flexDirection: "row",
        justifyContent: "center",
        width: "100%",
        marginTop: "20px",
      }}>
        <TeamStats team="blue"/>
        <TeamStats team="red"/>
      </div>
    </div>
  )
}
