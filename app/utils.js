import theme from '@/app/styles/theme';

export const SYSTEMS_INFO = [
    {
        name: "silence",
        color: theme.purple,
        maxCharge: 6,
    },
    {
        name: "scan",
        color: theme.green,
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
