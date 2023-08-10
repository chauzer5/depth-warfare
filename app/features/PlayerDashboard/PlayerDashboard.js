import { useGameContext } from "@/app/state/game_state";
import DashboardHeader from "./DashboardHeader";
import CaptainDashboard from "./CaptainDashboard/CaptainDashboard";
import EngineerDashboard from "./EngineerDashboard/EngineerDashboard";
import FirstMateDashboard from "./FirstMateDashboard/FirstMateDashboard";
import RadioOperatorDashboard from "./RadioOperatorDashboard/RadioOperatorDashboard";

export default function PlayerDashboard(props){
    const { playerRole } = useGameContext();
    const { channel } = props;

    return (
        <div style={{display: "flex", flexDirection: "column", width: "100%", height: "100vh"}}>
            <DashboardHeader />
            {
                playerRole === "captain" ? <CaptainDashboard channel={channel}/> :
                playerRole === "engineer" ? <EngineerDashboard channel={channel}/> :
                playerRole === "first-mate" ? <FirstMateDashboard channel={channel}/> :
                playerRole === "radio-operator" ? <RadioOperatorDashboard channel={channel}/> :
                null
            }
        </div>
    );
}