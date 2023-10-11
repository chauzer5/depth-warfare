import { useGameContext } from "@/app/state/game_state";
import theme from "@/app/styles/theme";
import useKeypress from "react-use-keypress";

export default function TriangleShiftButton(props) {
  const { direction, channel } = props;
  const { radioMapNotes, playerTeam } = useGameContext();

  const w = "30";
  const h = "30";
  const color = theme.white;
  const disabledColor = theme.gray;

  let disabled = false;

  switch (direction) {
    case "north":
      if (radioMapNotes[playerTeam].some((note) => note[0] === 0)) {
        disabled = true;
      }
      break;
    case "south":
      if (
        radioMapNotes[playerTeam].some(
          (note) => note[0] === process.env.MAP_DIMENSION - 1
        )
      ) {
        disabled = true;
      }
      break;
    case "west":
      if (radioMapNotes[playerTeam].some((note) => note[1] === 0)) {
        disabled = true;
      }
      break;
    case "east":
      if (
        radioMapNotes[playerTeam].some(
          (note) => note[1] === process.env.MAP_DIMENSION - 1
        )
      ) {
        disabled = true;
      }
      break;
    default:
      console.error(`Unrecognized direction: ${direction}`);
  }

  const handleClick = () => {
    channel.publish("radio-operator-shift-notes", { direction });
  };

  const keyName =
    direction === "north"
      ? "ArrowUp"
      : direction === "south"
      ? "ArrowDown"
      : direction === "west"
      ? "ArrowLeft"
      : direction === "east"
      ? "ArrowRight"
      : null;

  useKeypress(keyName, () => {
    if (!disabled) {
      handleClick();
    }
  });

  const points = {
    north: [`${w / 2},0`, `0,${h}`, `${w},${h}`],
    east: [`0,0`, `0,${h}`, `${w},${h / 2}`],
    south: [`0,0`, `${w},0`, `${w / 2},${h}`],
    west: [`${w},0`, `${w},${h}`, `0,${h / 2}`],
  };

  return (
    <svg
      cursor={disabled ? "not-allowed" : "pointer"}
      width={w}
      height={h}
      onClick={disabled ? null : handleClick}
    >
      <polygon
        points={points[direction].join(" ")}
        fill={disabled ? disabledColor : color}
      />
    </svg>
  );
}
