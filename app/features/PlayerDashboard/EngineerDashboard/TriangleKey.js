export default function TriangleKey(props) {
  const { direction, color } = props;

  const w = 30;
  const h = 30;

  const points = {
    north: [`${w / 2},0`, `0,${h}`, `${w},${h}`],
    east: [`0,0`, `0,${h}`, `${w},${h / 2}`],
    south: [`0,0`, `${w},0`, `${w / 2},${h}`],
    west: [`${w},0`, `${w},${h}`, `0,${h / 2}`],
  };

  return (
    <svg width={w} height={h}>
      <polygon points={points[direction].join(" ")} fill={color} />
    </svg>
  );
}
