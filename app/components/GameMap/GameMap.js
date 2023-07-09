import { Box } from "@mui/material";
import { useGameContext } from "../../context/game_state";
import { indexToColumn, indexToRow } from "../../utils";

export default function GameMap (props) {
    const { handleClick } = props;
    const { gameMap, playerTeam } = useGameContext();

    const MAP_DIMENSION = 15;

    const styles = {
        table: {
            borderCollapse: "collapse",
        },
        cell: {
            border: "2px solid #00FF00",
            borderCollapse: "collapse",
            width: "26px",
            padding: 0,
        },
        row: {
            height: "20px",
        },
        columnHeader: {
            width: "26px",
        },
        island: {
            width: "26px",
            height: "26px",
            backgroundColor: "white",
        },
        water: {
            width: "26px",
            height: "26px",
            "&:hover": {
                backgroundColor: "#00FF00",
            },
        },
        blueSub: {
            width: "26px",
            height: "26px",
            backgroundColor: "blue",
            "&:hover": {
                backgroundColor: "#00FF00",
            },
        },
        redSub: {
            width: "26px",
            height: "26px",
            backgroundColor: "red",
            "&:hover": {
                backgroundColor: "#00FF00",
            },
        },
    };

    return (
        <table style={styles.table}>
            <tbody>
                <tr style={styles.row}>
                    <td></td>
                    {Array(MAP_DIMENSION).fill(0).map((col, index) => (
                        <th style={styles.columnHeader} key={index}>{indexToColumn(index)}</th>
                    ))}
                </tr>

                {gameMap.map((row, index) => (
                    <tr key={index} style={styles.row}>
                        <th>{indexToRow(index)}</th>
                        {row.map((cell, index) => (
                            <td key={index} style={styles.cell}>
                                {
                                    cell.type === "island" ? (
                                        <div style={styles.island} onClick={() => handleClick(cell)}/>
                                    ) :
                                    cell.blueSub && playerTeam === "blue" ? (
                                        <Box sx={styles.blueSub} onClick={() => handleClick(cell)}/>
                                    ) :
                                    cell.redSub && playerTeam === "red" ? (
                                        <Box sx={styles.redSub} onClick={() => handleClick(cell)}/>
                                    ) : 
                                    <Box sx={styles.water} onClick={() => handleClick(cell)}>
                                        
                                    </Box>
                                }
                            </td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    );
}