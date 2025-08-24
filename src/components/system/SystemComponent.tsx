import { SystemApi } from "../../api/system-api";
import { ButtonComponent } from "../ui/ButtonComponent";

export const SystemComponent = () => {
  return (
    <div className="grid grid-cols-1 gap-4">
      <ButtonComponent onClick={async () => await SystemApi.reboot()}>
        Reboot
      </ButtonComponent>
      <ButtonComponent onClick={async () => await SystemApi.restartService()}>
        Restart GullTV service
      </ButtonComponent>
    </div>
  );
};
