import  { WebSocketServer, WebSocket } from "ws";

class WebSocketServerWrapper {
  private wss: WebSocketServer;
  private port;
  private isStarted = false;

  constructor(port: number = 3000) {
    this.port = port;
    this.wss = new WebSocketServer({ port: this.port });
  }

  public start() : void {
    if (this.isStarted) return;

    this.wss.on("connection", (ws: WebSocket) => {
      console.log("✅ WebSocket connected");
    
      ws.on("message", (message: WebSocket.RawData) => {
        this.wss.clients.forEach((client) => {
          if (client !== ws) {
            if(client.readyState === WebSocket.OPEN) {
              client.send(message.toString());
            }
          }
        })
      });
    
      ws.on("close", () => {
        console.log("❌ Client disconnected");
      });
    });

    this.isStarted = true;
  }
}

export const webSocketServer = new WebSocketServerWrapper(4000);
