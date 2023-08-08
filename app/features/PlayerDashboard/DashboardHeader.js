import { useGameContext } from "@/app/state/game_state";
import dayjs from 'dayjs';
import { useState } from "react";
import { ROLE_MAP } from "@/app/utils";

export default function DashboardHeader(){
    const { playerRole, playerTeam } = useGameContext();

    const styles = {
        main: {
            width: "100%",
            height: "50px",
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
        },
        team: {
            color: playerTeam,
        },
        role: {
            marginLeft: "15px",
            color: "white",
        },
        clock: {
            marginRight: "15px",
            color: "white",
        },
    };

    const [clock, setClock] = useState(dayjs().format('HH:mm:ss'));

    setInterval(() => {
        setClock(dayjs().format('HH:mm:ss'));
    }, 100);

    const timeZone = new Date().toLocaleTimeString('en-us',{timeZoneName:'short'}).split(' ')[2]

    return (
        <div style={styles.main}>
            <h4 style={styles.role}><span style={styles.team}>{`${playerTeam.charAt(0).toUpperCase() + playerTeam.slice(1)} Team`}</span>
             {` ${ROLE_MAP[playerRole]}`}</h4>
            <h4 style={styles.clock}>{`${clock} ${timeZone}`}</h4>
        </div>
    );
}