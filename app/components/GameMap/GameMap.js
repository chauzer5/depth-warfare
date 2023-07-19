import { Box } from "@mui/material";
import { useGameContext } from "../../context/game_state";
import { indexToColumn, indexToRow } from "../../utils";

export default function GameMap (props) {
    const { handleClick } = props;
    const { gameMap, playerTeam } = useGameContext();

    const MAP_DIMENSION = 15;
    const SECTOR_DIMENSION = 5;

    const styles = {
        table: {
            borderCollapse: "collapse",
        },
        cell: {
            border: "2px solid #00FF00",
            borderCollapse: "collapse",
            width: "25px",
            padding: 0,
        },
        columnHeader: {
            width: "25px",
        },
        island: {
            width: "25px",
            height: "25px",
            backgroundColor: "white",
        },
        water: {
            width: "25px",
            height: "25px",
            "&:hover": {
                backgroundColor: "#00FF00",
            },
        },
        blueSub: {
            width: "25px",
            height: "25px",
            backgroundColor: "blue",
        },
        redSub: {
            width: "25px",
            height: "25px",
            backgroundColor: "red",
        },
    };

    const getSectorStyle = (row, column) => {
        const sectorStyle = {};

        if(column % SECTOR_DIMENSION === 0){
            sectorStyle.borderLeft = "5px solid #00FF00";
        }

        if(column === MAP_DIMENSION - 1){
            sectorStyle.borderRight = "5px solid #00FF00";
        }

        if(row % SECTOR_DIMENSION === 0){
            sectorStyle.borderTop = "5px solid #00FF00";
        }

        if(row === MAP_DIMENSION - 1){
            sectorStyle.borderBottom = "5px solid #00FF00";
        }

        return sectorStyle;
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

                {gameMap.map((row, rowIndex) => (
                    <tr key={rowIndex} style={styles.row}>
                        <th>{indexToRow(rowIndex)}</th>
                        {row.map((cell, columnIndex) => (
                            <td key={columnIndex} style={{...styles.cell, ...getSectorStyle(rowIndex, columnIndex)}}>
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
                                    <Box sx={styles.water} onClick={() => handleClick(cell, rowIndex, columnIndex)}>
                                        
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