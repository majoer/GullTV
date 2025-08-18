import { WebSocket, WebSocketServer } from "ws";
import { WebsocketEvent } from "../../domain/websocket";
import { logger } from "../logger";

export const WebSocketComs = {
  broadcaster:
    (webSocketServer: WebSocketServer) => (event: WebsocketEvent) => {
      webSocketServer.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          const payload = JSON.stringify(event);
          logger.debug(`Sending event ${payload}`);
          client.send(payload);
        }
      });
    },
};
