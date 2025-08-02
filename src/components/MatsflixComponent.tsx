import { FileNavigator } from "./FileNavigator";
import { MediaControlPanel } from "./MediaControlPanel";

export const MatsflixComponent = () => {
  return (
    <div className="m-auto w-1/2">
      <FileNavigator />
      <MediaControlPanel />
    </div>
  );
};
