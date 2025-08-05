import { Observable, Subscription } from "rxjs";
import { WebSocket, WebSocketServer } from "ws";
import { WebsocketEvent } from "../../domain/websocket";
import { logger } from "../logger";

export const bindWebsockets = (
  webSocketServer: WebSocketServer,
  eventEmitter: Observable<WebsocketEvent>
) => {
  let subscription: Subscription | undefined;

  webSocketServer.on("connection", () => {
    if (subscription && !subscription.closed) {
      logger.info("Vlc subscription found, all is good");
      return;
    }

    logger.info("No subscription found, subscribing to vlc");
    subscription = eventEmitter.subscribe((event) => {
      webSocketServer.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(event));
        }
      });

      if (
        event.type === "status" &&
        event.data.data.state !== "playing" &&
        webSocketServer.clients.size === 0
      ) {
        logger.info("No one is online or watching, unsubscribing");
        subscription?.unsubscribe();
      }
    });
  });
};
