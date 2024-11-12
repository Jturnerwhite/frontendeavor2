'use client'
import { HexTile } from '@/app/hex/architecture/interfaces';

interface HexProps {
  radius: number;
  hexData: HexTile;
}

const Hex: React.FC<HexProps> = ({ radius, hexData }): JSX.Element => {
  let { x, y } = hexData.position;
  // Calculate the points for a hexagon centered at (x, y)
  // Each point is calculated using the radius and the angle (in radians) from the center
  // The angles used are 0, 60, 120, 180, 240, and 300 degrees converted to radians
  const points = [
    `${x + radius},${y}`,
    `${x + radius * Math.cos(Math.PI / 3)},${y + radius * Math.sin(Math.PI / 3)}`,
    `${x + radius * Math.cos((2 * Math.PI) / 3)},${y + radius * Math.sin((2 * Math.PI) / 3)}`,
    `${x - radius},${y}`,
    `${x + radius * Math.cos((4 * Math.PI) / 3)},${y + radius * Math.sin((4 * Math.PI) / 3)}`,
    `${x + radius * Math.cos((5 * Math.PI) / 3)},${y + radius * Math.sin((5 * Math.PI) / 3)}`
  ].join(' ');

  return (
    <>
      <polygon
        points={points}
        fill="none"
        stroke="white"
        strokeWidth={2} />

      <text
        x={x}
        y={y}
        textAnchor="middle"
        dominantBaseline="middle"
        fill="white"
        fontSize={radius / 2}
      >
        {hexData.index}
      </text>
    </>
  );
}

export default Hex;