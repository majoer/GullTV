declare module "cec-controller" {
  import { EventEmitter } from "events";

  interface Device {
    name: string;
    logicalAddress: string;
    address: string;
    activeSource: string;
    vendor: string;
    osdString: string;
    cecVersion: string;
    powerStatus: string;
    language: string;
    turnOn(): void;
    turnOff(): void;
    togglePower(): void;
    changeSource?(port?: number): void;
    sendKey?(key: string): void;
  }

  type CecControllerInstance = {
    setActive(): void;
    setInactive(): void;
    volumeUp(): void;
    volumeDown(): void;
    mute(): void;
    getKeyNames(): string[];
    command(input: string): void;
  } & { [deviceId: string]: Device };

  class CecController extends EventEmitter {
    constructor();
    on(
      event: "ready",
      listener: (controller: CecControllerInstance) => void
    ): this;
    on(event: "error", listener: (err: Error) => void): this;
    on(event: string, listener: (...args: any[]) => void): this;
  }

  export = CecController;
}
