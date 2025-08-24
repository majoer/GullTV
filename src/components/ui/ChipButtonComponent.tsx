import type { ReactNode } from "react";
import { ButtonComponent } from "./ButtonComponent";

export interface ChipButtonComponentProps {
  selected: boolean;
  children: ReactNode;
  onClick: () => void;
}

export const ChipButtonComponent = ({
  selected,
  children,
  onClick,
}: ChipButtonComponentProps) => {
  return (
    <ButtonComponent
      className={`${
        selected ? "bg-green-900" : ""
      }`}
      onClick={onClick}
    >
      {children}
    </ButtonComponent>
  );
};
