import { useGameContext } from "@/app/context/game_state";
import DashboardHeader from "./DashboardHeader";
import CaptainDashboard from "./CaptainDashboard/CaptainDashboard";
import EngineerDashboard from "./EngineerDashboard/EngineerDashboard";
import FirstMateDashboard from "./FirstMateDashboard/FirstMateDashboard";
import RadioOperatorDashboard from "./RadioOperatorDashboard/RadioOperatorDashboard";

export default function PlayerDashboard(){
    const { playerRole } = useGameContext();

    return (
        <>
            <DashboardHeader />
            {
                playerRole === "captain" ? <CaptainDashboard /> :
                playerRole === "engineer" ? <EngineerDashboard /> :
                playerRole === "first-mate" ? <FirstMateDashboard /> :
                playerRole === "radio-operator" ? <RadioOperatorDashboard /> :
                null
            }
        </>
    );
}