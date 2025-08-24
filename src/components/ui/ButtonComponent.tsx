import type { ButtonHTMLAttributes } from "react";

export type ButtonComponentProps = {} & ButtonHTMLAttributes<HTMLButtonElement>;

export const ButtonComponent = (props: ButtonComponentProps) => {
  const { children, className, ...rest } = props;
  return (
    <button className={`bg-gray-800 hover:opacity-75 rounded-2xl p-2 cursor-pointer ${className ?? ""}`} {...rest}>
      {children}
    </button>
  );
};
