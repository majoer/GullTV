import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { MediaApi } from "../../api/media-api";
import { Icon } from "../ui/Icon";
import { NavLinkComponent } from "../ui/NavLinkComponent";

export const RecentsComponent = () => {
  const { data, isPending, isError } = useQuery({
    queryKey: ["view-progress"],
    queryFn: () => MediaApi.getViewProgress(),
  });

  const recents = useMemo(() => {
    const progressMap = data?.progressMap || [];
    return Object.keys(progressMap || [])
      .sort(
        (a, b) => (progressMap as any)[b].time - (progressMap as any)[a].time
      )
      .splice(0, 3);
  }, [data]);

  if (isPending || isError) {
    return;
  }

  return (
    <div>
      Continue watching
      <div className="grid grid-cols-1 md:grid-cols-3">
        {recents.map((r) => (
          <NavLinkComponent
            key={r}
            className={`m-2 p-2 bg-gray-800 rounded-md overflow-clip`}
            to={`/matsflix/${r}`}
          >
            <div className="flex justify-between items-center">
              <div className="break-all">{r}</div>
              <Icon.FOLDER className="shrink-0 fill-yellow-200" />
            </div>
          </NavLinkComponent>
        ))}
      </div>
    </div>
  );
};
