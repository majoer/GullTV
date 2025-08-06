import { useState } from "react";

export interface SliderComponentProps {
  orientation: "vertical" | "horizontal";
  style: "black" | "white";
  value: number;
  max: number;
  className?: string;
  onChange: (value: number) => void;
  formatTitle?: (value: number) => string;
}

export const SliderComponent = (props: SliderComponentProps) => {
  const {
    orientation,
    value,
    max,
    style,
    onChange,
    formatTitle = (v) => `${v}`,
  } = props;

  const [title, setTitle] = useState("0");
  const position = (100 * (value || 0)) / max;
  const horizontal = orientation === "horizontal";

  return (
    <div
      title={title}
      onMouseMove={(e) => {
        const value = calculateValue(e, max, horizontal);
        const title = formatTitle(value);

        setTitle(title);
      }}
      className={`${
        horizontal ? "w-full h-2 my-3" : "w-2 h-full"
      } rounded-2xl relative cursor-pointer ${
        style === "black" ? "bg-black" : "bg-sky-100"
      }`}
      onClick={async (e) => {
        onChange(calculateValue(e, max, horizontal));
      }}
    >
      <div
        className={`absolute ${
          horizontal ? "top-1/2 -translate-y-1/2" : "left-1/2 translate-y-1/2"
        }  -translate-x-1/2 cursor-pointer`}
        style={
          horizontal ? { left: `${position}%` } : { bottom: `${position}%` }
        }
      >
        🟠
      </div>
    </div>
  );
};

function calculateValue(
  e: React.MouseEvent<HTMLDivElement, MouseEvent>,
  max: number,
  horizontal: boolean
): number {
  const ratio = horizontal
    ? e.nativeEvent.offsetX / e.currentTarget.clientWidth
    : (e.currentTarget.clientHeight - e.nativeEvent.offsetY) /
      e.currentTarget.clientHeight;

  return Math.round(ratio * max);
}
