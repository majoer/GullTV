import type { ButtonHTMLAttributes } from "react";

export type ButtondProps = {} & ButtonHTMLAttributes<HTMLButtonElement>;

export const Button = (props: ButtondProps) => {
  const { className, ...rest } = props;

  return <button {...rest} className={`cursor-pointer text-6xl ${className}`}>{props.children}</button>;
};
