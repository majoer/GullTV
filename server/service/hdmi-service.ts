/// <reference path="../types/cec-controller.d.ts" />
import CecController from "cec-controller";

export const HdmiService = () => {
  const cec = new CecController();

  cec.on("ready", (controller) => console.log(controller));
  cec.on("error", console.error);
};
