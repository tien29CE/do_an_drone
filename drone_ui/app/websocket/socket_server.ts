import { client } from "websocket";
import  { WebSocketServer, WebSocket } from "ws";

class WebSocketServerWrapper {
  private wss: WebSocketServer;
  private port;
  private isStarted = false;

  constructor(port: number = 3000) {
    this.port = port;
    this.wss = new WebSocketServer({ port: this.port });
  }

  public start() {
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

export class WebSocketClientWrapper {
  private ws: WebSocket;
  private url: string;

  constructor(url: string) {
    this.url = url;
    this.ws = new WebSocket(url);
  }

  // Kết nối tới server WebSocket
  public start(): void {
    this.ws.on("open", () => {
      console.log("✅ Connected to WebSocket server");
      // Bạn có thể gửi tin nhắn ngay khi kết nối thành công, nếu cần
      // this.send("Hello from client!");
    });

    this.ws.on("message", (data: WebSocket.Data) => {
      // Xử lý tin nhắn nhận được
      console.log("📥 Received:", data.toString());
    });

    this.ws.on("close", () => {
      console.log("❌ Disconnected from WebSocket server");
    });

    this.ws.on("error", (error: Error) => {
      console.error("⚠️ WebSocket error:", error);
    });
  }

  // Gửi tin nhắn đến server
  public sendData(
    mode: "marker" | "polygon",
    markers: Float64Array,
    polygonPoints: Float64Array
  ) {
    if (markers.length === 0 && polygonPoints.length === 0) return;

    const dataToSend =
      mode === "marker"
        ? { mode, markers: Array.from(markers) }
        : { mode, polygonPoints: Array.from(polygonPoints) };

    const message = JSON.stringify(dataToSend);

    this.ws.send(message);
  };
}

export const webSocketServer = new WebSocketServerWrapper(4000);
export const webSocketClient = new WebSocketClientWrapper('ws://localhost:4000')
