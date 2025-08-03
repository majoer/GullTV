import type { ButtonHTMLAttributes } from "react";

export type ButtondProps = {} & ButtonHTMLAttributes<HTMLButtonElement>;

export const MediaButton = (props: ButtondProps) => {
  const { className, ...rest } = props;

  return (
    <button
      {...rest}
      className={`cursor-pointer w-20 h-20 fill-orange-500 hover:fill-orange-300 ${className}`}
    >
      {props.children}
    </button>
  );
};
