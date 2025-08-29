import { useCallback, useEffect, useRef, useState } from "react";
import { useDebouncedCallback } from "use-debounce";

export interface SliderComponentProps {
  orientation: "vertical" | "horizontal";
  style: "black" | "white";
  value: number;
  max: number;
  disabled: boolean;
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
    disabled,
    formatTitle = (v) => `${v}`,
  } = props;

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
    (
      me?: React.MouseEvent<HTMLDivElement, MouseEvent>,
      te?: React.TouchEvent<HTMLDivElement>
    ): number => {
      const currentTarget = me ? me.currentTarget : te!.currentTarget;
      const sliderPathDiv = currentTarget.parentElement!!;
      const rect = sliderPathDiv.getBoundingClientRect();

      const clientX = me ? me.clientX : te!.touches[0]!.clientX;
      const clientY = me ? me.clientY : te!.touches[0]!.clientY;
      const ratio = horizontal
        ? (clientX - rect.left) / sliderPathDiv.clientWidth
        : (clientY - rect.top) / sliderPathDiv.clientHeight;

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
        if (disabled) return;
        const value = calculateClickValue(e);
        const title = formatTitle(value);

        setTitle(title);
      }}
      className={`touch-none rounded-2xl relative
         ${horizontal ? "w-full h-2 my-3" : "w-2 h-full"} 
         ${style === "black" ? "bg-black" : "bg-sky-100"} 
         ${disabled ? "cursor-not-allowed" : "cursor-pointer"}`}
      onClick={async (e) => {
        if (disabled) return
        onChange(calculateClickValue(e));
      }}
    >
      <div
        className={`w-10 h-10 absolute -translate-x-1/2
           ${
             horizontal
               ? "top-1/2 -translate-y-1/2"
               : "left-1/2 translate-y-1/2"
           }
            ${disabled ? "cursor-not-allowed" : "cursor-pointer"}`}
        style={
          horizontal ? { left: `${position}%` } : { bottom: `${position}%` }
        }
        draggable={true}
        onDragStart={(e) => {
          if (disabled) return;
          var hiddenElement = document.getElementById("hiddenDragImage")!!;
          e.dataTransfer.setDragImage(hiddenElement, 0, 0);
          setDragging(true);
        }}
        onTouchStart={(e) => {
          if (disabled) return;
          e.preventDefault();
          e.stopPropagation();
          setDragging(true);
        }}
        onDragEnd={() => setDragging(false)}
        onTouchEnd={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setDragging(false);
        }}
        onDrag={(e) => {
          if (disabled) return;
          if (e.clientX === 0 && e.clientY === 0) {
            return;
          }
          onChange(calculateDragValue(e));
        }}
        onTouchMove={(e) => {
          if (disabled) return;
          e.preventDefault();
          e.stopPropagation();

          if (e.touches[0]?.clientX === 0 && e.touches[0]?.clientY === 0) {
            return;
          }
          onChange(calculateDragValue(undefined, e));
        }}
        onMouseDown={(e) => {
          e.stopPropagation();
        }}
      >
        <div
          className={`absolute left-1/2 top-1/2 -translate-1/2 rounded-full w-5 h-5 ${
            disabled ? "bg-gray-400" : "bg-orange-500"
          }`}
        ></div>
      </div>
    </div>
  );
};
