import type { ButtonHTMLAttributes } from "react";

export type MediaButtonComponentProps =
  {} & ButtonHTMLAttributes<HTMLButtonElement>;

export const MediaButtonComponent = (props: MediaButtonComponentProps) => {
  const { className, children, ...rest } = props;

  return (
    <button
      {...rest}
      className={`cursor-pointer w-15 h-15 fill-orange-500 hover:fill-orange-300 ${className ?? ''}`}
    >
      {children}
    </button>
  );
};
