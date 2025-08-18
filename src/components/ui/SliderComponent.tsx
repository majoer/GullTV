import { useCallback, useEffect, useRef, useState } from "react";
import { useDebouncedCallback } from "use-debounce";

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
  const { orientation, value, max, style, formatTitle = (v) => `${v}` } = props;

  const [title, setTitle] = useState("0");
  const [internalValue, setInternalValue] = useState(value);
  const [dragging, setDragging] = useState(false);

  const lastUpdated = useRef(Date.now());
  const position = (100 * (internalValue || 0)) / max;
  const horizontal = orientation === "horizontal";
  const debounced = useDebouncedCallback(props.onChange, 300);
  const onChange = useCallback((newValue: number) => {
    setInternalValue(newValue);
    debounced(newValue);
    lastUpdated.current = Date.now();
  }, []);

  const calculateClickValue = useCallback(
    (e: React.MouseEvent<HTMLDivElement, MouseEvent>): number => {
      const ratio = horizontal
        ? e.nativeEvent.offsetX / e.currentTarget.clientWidth
        : (e.currentTarget.clientHeight - e.nativeEvent.offsetY) /
          e.currentTarget.clientHeight;

      return Math.round(ratio * max);
    },
    [max]
  );

  const calculateDragValue = useCallback(
    (e: React.MouseEvent<HTMLDivElement, MouseEvent>): number => {
      const sliderPathDiv = e.currentTarget.parentElement!!;
      var rect = sliderPathDiv.getBoundingClientRect();

      const ratio = horizontal
        ? (e.clientX - rect.left) / sliderPathDiv.clientWidth
        : (e.clientY - rect.top) / sliderPathDiv.clientHeight;

      const value = horizontal ? ratio * max : max - ratio * max;

      return Math.max(0, Math.min(Math.round(value), max));
    },
    [max]
  );

  useEffect(() => {
    const timeSinceLastInternalChange = Date.now() - lastUpdated.current;
    if (!dragging && timeSinceLastInternalChange > 1500) {
      setInternalValue(value);
    }
  }, [value]);

  return (
    <div
      title={title}
      onMouseMove={(e) => {
        const value = calculateClickValue(e);
        const title = formatTitle(value);

        setTitle(title);
      }}
      className={`${
        horizontal ? "w-full h-2 my-3" : "w-2 h-full"
      } rounded-2xl relative cursor-pointer ${
        style === "black" ? "bg-black" : "bg-sky-100"
      }`}
      onMouseDown={async (e) => {
        onChange(calculateClickValue(e));
      }}
    >
      <div
        className={`absolute ${
          horizontal ? "top-1/2 -translate-y-1/2" : "left-1/2 translate-y-1/2"
        }  -translate-x-1/2 cursor-pointer`}
        style={
          horizontal ? { left: `${position}%` } : { bottom: `${position}%` }
        }
        draggable={true}
        onDragStart={(e) => {
          var hiddenElement = document.getElementById("hiddenDragImage")!!;
          e.dataTransfer.setDragImage(hiddenElement, 0, 0);
          setDragging(true);
        }}
        onDragEnd={() => setDragging(false)}
        onDrag={(e) => {
          if (e.clientX === 0 && e.clientY === 0) {
            return;
          }
          onChange(calculateDragValue(e));
        }}
        onMouseDown={(e) => {
          e.stopPropagation();
        }}
      >
        🟠
      </div>
    </div>
  );
};
