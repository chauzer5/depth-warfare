import TeamRoleButton from "./TeamRoleButton";
import { useGameContext } from "../../state/game_state";
import { useEffect } from "react";

export default function TeamSelection(props) {
  const styles = {
    main: {
      width: "100%",
      height: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    },
    container: {
      width: "650px",
      height: "450px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
    },
    selectors: {
      display: "flex",
      flexDirection: "row",
      width: "100%",
    },
    team: {
      width: "50%",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
    }
  };

  const {
    presenceData,
    updateStatus,
  } = props;

  const {
    username,
    selfClientId,
    setCurrentStage,
    setPlayerTeam,
    setPlayerRole,
    setPlayerData,
  } = useGameContext();

  useEffect(() => {
    if(presenceData.length === process.env.NUM_REQUIRED_PLAYERS && !presenceData.find(player => !player.data.team)){
      setPlayerTeam(presenceData.find(player => player.clientId === selfClientId).data.team);
      setPlayerRole(presenceData.find(player => player.clientId === selfClientId).data.role);

      const newPlayerData = presenceData.map((player) => {
        return {
          username: player.data.name,
          clientId: player.clientId,
          team: player.data.team,
          role: player.data.role,
        };
      });

      setPlayerData(newPlayerData);
      setCurrentStage("starting-spot");
    }
  }, [presenceData]);

  const handleClick = (selectedTeam, selectedRole) => {
    const playerSelected = presenceData.find((player) => {
      return (player.data.team === selectedTeam && player.data.role === selectedRole);
    });

    if(!playerSelected){
      updateStatus({ name: username, team: selectedTeam, role: selectedRole});
    }
    else if(playerSelected.clientId === selfClientId){
      updateStatus({ name: username, team: null, role: null });
    }
  };

  return (
    <div style={styles.main}>
      <div style={styles.container}>
        <h3>Pick your team and role</h3>
        <div style={styles.selectors}>
          <div style={styles.team}>
            <TeamRoleButton presenceData={presenceData} handleClick={handleClick} team="blue" role="captain"/>
            <TeamRoleButton presenceData={presenceData} handleClick={handleClick} team="blue" role="first-mate"/>
            <TeamRoleButton presenceData={presenceData} handleClick={handleClick} team="blue" role="engineer"/>
            <TeamRoleButton presenceData={presenceData} handleClick={handleClick} team="blue" role="radio-operator"/>
          </div>
          <div style={styles.team}>
            <TeamRoleButton presenceData={presenceData} handleClick={handleClick} team="red" role="captain"/>
            <TeamRoleButton presenceData={presenceData} handleClick={handleClick} team="red" role="first-mate"/>
            <TeamRoleButton presenceData={presenceData} handleClick={handleClick} team="red" role="engineer"/>
            <TeamRoleButton presenceData={presenceData} handleClick={handleClick} team="red" role="radio-operator"/>
          </div>
        </div>
      </div>
    </div>
  );
}