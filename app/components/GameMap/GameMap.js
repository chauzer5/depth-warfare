import { Box } from "@mui/material";
import { useGameContext } from "../../context/game_state";
import { indexToColumn, indexToRow } from "../../utils";
import theme from "@/app/styles/theme";

export default function GameMap (props) {
    const { handleClick } = props;
    const { gameMap, playerTeam } = useGameContext();

    const MAP_DIMENSION = 15;
    const SECTOR_DIMENSION = 5;

    const styles = {
        table: {
            borderCollapse: "collapse",
            maxHeight: `${(MAP_DIMENSION + 1) * 25}px`,
        },
        cell: {
            border: `2px solid ${theme.green}`,
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
            backgroundColor: theme.darkGreen,
        },
        water: {
            width: "25px",
            height: "26px",
            "&:hover": {
                backgroundColor: handleClick ? theme.green : theme.black,
            },
        },
        blueSub: {
            width: "25px",
            height: "26px",
            backgroundColor: theme.blue,
        },
        redSub: {
            width: "25px",
            height: "26px",
            backgroundColor: theme.red,
        },
    };

    const getSectorStyle = (row, column) => {
        const sectorStyle = {};

        if(column % SECTOR_DIMENSION === 0){ sectorStyle.borderLeft = `5px solid ${theme.green}`; }
        if(column === MAP_DIMENSION - 1){ sectorStyle.borderRight = `5px solid ${theme.green}`; }
        if(row % SECTOR_DIMENSION === 0){ sectorStyle.borderTop = `5px solid ${theme.green}`; }
        if(row === MAP_DIMENSION - 1){ sectorStyle.borderBottom = `5px solid ${theme.green}`; }

        return sectorStyle;
    };

    const getIslandBorders = (row, column) => {
        const islandStyle = {};

        const cell = gameMap[row][column];
        if(cell.type != "island"){ return islandStyle; }
        
        islandStyle.border = "none";
        islandStyle.backgroundColor = theme.darkGreen;

        return islandStyle;
    }

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
                            <td key={columnIndex} style={{
                                ...styles.cell,
                                ...getSectorStyle(rowIndex, columnIndex),
                                ...getIslandBorders(rowIndex, columnIndex)
                            }}>
                                {
                                    cell.type === "island" ? (
                                        <div style={styles.island} onClick={handleClick ? () => handleClick(cell, rowIndex, columnIndex) : null}/>
                                    ) :
                                    cell.blueSub && playerTeam === "blue" ? (
                                        <Box sx={styles.blueSub} onClick={handleClick ? () => handleClick(cell, rowIndex, columnIndex) : null}/>
                                    ) :
                                    cell.redSub && playerTeam === "red" ? (
                                        <Box sx={styles.redSub} onClick={handleClick ? () => handleClick(cell, rowIndex, columnIndex) : null}/>
                                    ) : 
                                    <Box sx={styles.water} onClick={handleClick ? () => handleClick(cell, rowIndex, columnIndex) : null}/>
                                }
                            </td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    );
}