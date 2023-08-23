import React, { useState, useEffect } from 'react'; // Import useState
import Modal from 'react-modal'
import { Box } from "@mui/material";
import { useGameContext } from "@/app/state/game_state";
import theme from "@/app/styles/theme";
import { capitalizeFirstLetter, ENGINEER_SYSTEMS_INFO } from "@/app/utils";


export default function RepairMatrix(props){
    const { channel, current_system } = props;

    const { repairMatrix, playerTeam, setRepairMatrix, pendingSystemDamage, pendingNavigate } = useGameContext();

    console.log("current system:")
    console.log(current_system)
    console.log(getColorByName(current_system))
    const MATRIX_SIZE = process.env.REPAIR_MATRIX_DIMENSION

    const [hoverColor, setHoverColor] = useState(null); // State to store the hover color

    useEffect(() => {
        // Update the hover color whenever the current_system changes
        const color = getColorByName(current_system);
        setHoverColor(color);
    }, [current_system]);

    const styles = {
        table: {
            borderCollapse: "collapse",
            maxHeight: `${(MATRIX_SIZE + 2) * 25}px`,
        },
        cell: {
            border: "none",
            borderCollapse: "collapse",
            width: "50px",
            height: "50px",
            padding: 0,
        },
        innerCell: {
            width: "50px",
            height: "50px",
            border: `2px solid ${theme.green}`,
            "&:hover": {
                backgroundColor: hoverColor,
            },
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
        },
        outerCell: {
            width: "50px",
            height: "50px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
        },
    }

    function getColorByName(systemName) {
        const systemInfo = ENGINEER_SYSTEMS_INFO.find(system => system.name === systemName);
        return systemInfo ? systemInfo.color : null;
    }

    const setBackgroundColor = (row, column) => {
        const cellStyle = {};

        const cell = repairMatrix[row][column];
    
        cellStyle.backgroundColor = getColorByName(cell.system);

        return cellStyle;
    }

    const cellIsClickable = (row, column) => {
        const cell = repairMatrix[row][column];
        return cell.system === "empty"

    }

    const handleClick = (row, column) => {
        // Create a copy of the repairMatrix
        const updatedMatrix = [...repairMatrix.map(row => [...row])];

        // Update the specific cell's system value with the current_system
        updatedMatrix[row][column] = {
            ...updatedMatrix[row][column],
            system: current_system,
        };

        setHoverColor(null)

        // Update the state with the new matrix
        setRepairMatrix(updatedMatrix);
        channel.publish("engineer-place-system-block", {system: current_system});
    };

    
    const clickable = pendingNavigate[playerTeam] && !pendingSystemDamage[playerTeam] ;   // Can add other statements to see if it can be clickable

    console.log(repairMatrix)

    // Functions for game goes here
    return (
        <table style={styles.table}>
            <tbody>
                {repairMatrix.map((row, rowIndex) => (
                    <tr key={rowIndex} style={styles.row}>
                        {row.map((cell, columnIndex) => (
                            <td key={columnIndex} style={{
                                ...styles.cell,
                                ...setBackgroundColor(rowIndex, columnIndex),
                            }}>
                                <Box
                                    sx={ cell.type === "outer" ? styles.outerCell : styles.innerCell }
                                    onClick={clickable && cell.system === "empty" && cell.type === "inner" ? () => handleClick(rowIndex, columnIndex) : null}
                                >
                                </Box>
                            </td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    );
    };

