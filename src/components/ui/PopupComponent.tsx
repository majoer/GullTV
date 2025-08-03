import type { ReactElement } from "react";

export interface PopupComponentProps {
  open: boolean;
  children: ReactElement;
}

export const PopupComponent = (props: PopupComponentProps) => {
  if (!props.open) {
    return <></>;
  }

  return (
    <div
      className="bg-white absolute bottom-full text-black p-2"
      onClick={(e) => e.stopPropagation()}
    >
      {props.children}
    </div>
  );
};
