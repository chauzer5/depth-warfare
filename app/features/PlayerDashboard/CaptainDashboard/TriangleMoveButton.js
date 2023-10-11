import theme from "@/app/styles/theme";

export default function TriangleMoveButton(props) {
  let { direction, channel, brokenEngine, disabled, enabledDirection } = props;

  const broken = brokenEngine && enabledDirection !== direction;

  const w = "30";
  const h = "30";
  const color = theme.green;
  const disabledColor = theme.darkGreen;
  const brokenColor = theme.black;

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
      cursor={disabled || broken ? "not-allowed" : "pointer"}
      width={w}
      height={h}
      onClick={disabled || broken ? null : handleClick}
    >
      <polygon
        points={points[direction].join(" ")}
        fill={broken ? brokenColor : disabled ? disabledColor : color}
      />
    </svg>
  );
}
