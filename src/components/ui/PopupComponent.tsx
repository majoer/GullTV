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
      className="bg-sky-100 rounded-md absolute bottom-full text-black p-2"
      onClick={(e) => e.stopPropagation()}
    >
      {props.children}
    </div>
  );
};
