import { NavLink, type NavLinkProps } from "react-router";

export type NavLinkComponentProps = {} & NavLinkProps;

export const NavLinkComponent = (props: NavLinkComponentProps) => {
  const { className, children, ...rest } = props;

  return (
    <NavLink className={`hover:bg-blue-900 ${className ?? ""}`} {...rest}>
      {children}
    </NavLink>
  );
};
