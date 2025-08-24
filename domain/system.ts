export type SystemAction = "restart-service" | "reboot";

export interface BaseSystemCommand {
  action: SystemAction;
}

export interface SimpleYoutubeCommand extends BaseSystemCommand {
  action: SystemAction;
  hasPayload: false;
}

export interface BaseSystemCommandWithPayload<T> extends BaseSystemCommand {
  data: T;
  hasPayload: true;
}

export interface SystemRestartService extends SimpleYoutubeCommand {
  action: "reboot";
}

export interface SystemReboot extends SimpleYoutubeCommand {
  action: "restart-service";
}

export type SystemCommand = SystemReboot | SystemRestartService;
