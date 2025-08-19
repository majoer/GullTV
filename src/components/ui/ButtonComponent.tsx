import type { ButtonHTMLAttributes } from "react";

export type ButtonComponentProps = {} & ButtonHTMLAttributes<HTMLButtonElement>;

export const ButtonComponent = (props: ButtonComponentProps) => {
  const { children, className, ...rest } = props;
  return (
    <button className={`cursor-pointer ${className ?? ""}`} {...rest}>
      {children}
    </button>
  );
};
