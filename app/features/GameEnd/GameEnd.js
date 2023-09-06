import { useGameContext } from "@/app/state/game_state";

export default function GameEnd(){

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

    const {
        systemHealthLevels,
        playerTeam,
    } = useGameContext();

    const teamDead = systemHealthLevels[playerTeam]["life support"] <= 0;
    const enemyTeamDead = systemHealthLevels[playerTeam === "red" ? "blue" : "red"]["life support"] <= 0;

    if(teamDead && enemyTeamDead){
        return (
            <div style={styles.main}>
                <p>{"Both subs were destroyed in the same explosion at the same time."}</p>
                <p>{"The result is a draw."}</p>
            </div>
        );
    }
    else if(enemyTeamDead){
        return (
            <div style={styles.main}>
                <p>{"You destroyed the enemy sub and won."}</p>
                <p>{"Congratulations for this outstanding achievement."}</p>
                <p>{"We're sure we'll see even greater things from you in the future."}</p>
            </div>
        );
    }
    else{
        return (
            <div style={styles.main}>
                <p>{"The enemy team destroyed your sub and you lost."}</p>
                <p>{"We expect to see better results from you next time."}</p>
            </div>
        );
    }
}