import  { WebSocket } from "ws";

export let imageSrc: string = ""; // Khởi tạo biến imageSrc ở đây

interface ReceiveData {
    id: string;
    command: string;
    mode: string;
    roll_deg: number;
    pitch_deg: number;
    yaw_deg: number;
    heading: number;
    altitude: number;
    lat: number;
    lon: number;
    battery: number;
    image: string; // base64 string
    wayPoints: any;
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
        });

        this.ws.on("message", (data: WebSocket.Data) => {
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
        command: "Follow markers" | "Calculate waypoints",
        mode: "marker" | "polygon",
        markers: Float64Array,
        polygonPoints: Float64Array
    ) {
        if (markers.length === 0 && polygonPoints.length === 0) return;

        const dataToSend =
        mode === "marker"
            ? { command, mode, markers: Array.from(markers) }
            : { command, mode, polygonPoints: Array.from(polygonPoints) };

        const message = JSON.stringify(dataToSend);

        this.ws.send(message);
    };
}

export const webSocketClient = new WebSocketClientWrapper('wss://drone-socket.onrender.com:443')