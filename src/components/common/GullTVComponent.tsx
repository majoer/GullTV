import { NavLinkComponent } from "../ui/NavLinkComponent";

const apps = [
  {
    path: "/matsflix",
    name: "Matsflix",
  },
  {
    path: "/noobtube",
    name: "NoobTube",
  },
];

export const GullTVComponent = () => {
  return (
    <div className="w-1/2 m-auto flex justify-center">
      {apps.map((app) => (
        <NavLinkComponent
          key={app.name}
          to={app.path}
          className="border-2 p-10 m-10 bg-orange-950"
        >
          {app.name}
        </NavLinkComponent>
      ))}
    </div>
  );
};
