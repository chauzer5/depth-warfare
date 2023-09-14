import { useGameContext } from "@/app/state/game_state";
import theme from "@/app/styles/theme";

export default function TriangleMoveButton(props) {
  let { direction, channel, brokenEngine, disabled, enabledDirection } = props;
  const { playerTeam, pendingNavigate } = useGameContext();

  const w = "30";
  const h = "30";
  const color = theme.green;
  const disabledColor = theme.darkGreen;
  const brokenColor = theme.black;

  if (brokenEngine) {
    if (direction === enabledDirection) {
      disabled = false;
      brokenEngine = false;
    }
  }

  if (pendingNavigate[playerTeam]) {
    disabled = true;
  }

  const handleClick = () => {
    channel.publish("captain-start-sub-navigate", { direction });
  };

  const points = {
    north: [`${w / 2},0`, `0,${h}`, `${w},${h}`],
    east: [`0,0`, `0,${h}`, `${w},${h / 2}`],
    south: [`0,0`, `${w},0`, `${w / 2},${h}`],
    west: [`${w},0`, `${w},${h}`, `0,${h / 2}`],
  };

  return (
    <svg
      cursor={disabled || brokenEngine ? "not-allowed" : "pointer"}
      width={w}
      height={h}
      onClick={disabled || brokenEngine ? null : handleClick}
    >
      <polygon
        points={points[direction].join(" ")}
        fill={brokenEngine ? brokenColor : disabled ? disabledColor : color}
      />
    </svg>
  );
}
