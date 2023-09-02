import theme from '@/app/styles/theme';

export const SYSTEMS_INFO = [
    {
        name: "silence",
        color: theme.purple,
        maxCharge: 6,
    },
    {
        name: "scan",
        color: theme.darkGreen,
        maxCharge: 4,
    },
    {
        name: "torpedo",
        color: theme.red,
        maxCharge: 4,
    },
    {
        name: "mine",
        color: theme.orange,
        maxCharge: 3,
    }
];

export const ENGINEER_SYSTEMS_INFO = [
    {
        name: "scan",
        color: theme.darkGreen
    },
    {
        name: "comms",
        color: theme.blue
    },
    {
        name: "weapons",
        color: theme.red
    },
    {
        name: "engine",
        color: theme.purple
    },
    {
        name: "life support",
        color: theme.gray
    }

];

export const ROLE_MAP = {
    "captain": "Captain",
    "first-mate": "First Mate",
    "engineer": "Engineer",
    "radio-operator": "Radio Operator",
};

export function rowToIndex(row){
    return row - 1;
}

export function indexToRow(index){
    return index + 1;
}

export function columnToIndex(col){
    return col.toLowerCase().charCodeAt(0) - 97;
}

export function indexToColumn (index){
    return String.fromCharCode(index + 97).toUpperCase();
}

export function capitalizeFirstLetter(string){
    return string.charAt(0).toUpperCase() + string.slice(1);
}

export function getOpposingTeam(team){
    return team === "red" ? "blue" : "red";
}

export function getRightAngleUnitVector(array){
    const [x, y] = array;
    if(x != 0){
        return [x/Math.abs(x), 0];
    }
    else {
        return [0, y/Math.abs(y)];
    }

}

export function getCellName(row, col) {
    // Convert the column index to a letter (assuming A=0, B=1, C=2, ...)
    const colLetter = String.fromCharCode('A'.charCodeAt(0) + col);

    // Add 1 to the row index to match 1-based indexing
    const rowNumber = row + 1;

    // Combine the letter and number to create the cell name
    const cellName = `${colLetter}${rowNumber}`;

    return cellName;
}

export function getCellSector(cell){
    const row = cell[0];
    const col = cell[1];
    const SECTORS_IN_ROW = process.env.MAP_DIMENSION / process.env.SECTOR_DIMENSION;

    const sector = (Math.floor(row/ process.env.SECTOR_DIMENSION) * SECTORS_IN_ROW ) + (Math.floor(col/process.env.SECTOR_DIMENSION)) + 1 ;
  
    return sector;
}
