import TeamRoleButton from "../components/TeamRoleButton";
import { useGameContext } from "../context/game_state";

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

  const { username, selfClientId } = useGameContext();

  const handleClick = (selectedTeam, selectedRole) => {
    const playerSelected = presenceData.filter((player) => {
      return (player.data.team === selectedTeam && player.data.role === selectedRole);
    })[0];

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