import  { WebSocket } from "ws";

export let imageSrc: string = ""; // Khởi tạo biến imageSrc ở đây

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
        var to = "drone";
        if (command === "Calculate waypoints") {
            to = "backend";
        }

        const dataToSend =
        mode === "marker"
            ? { command, mode, markers: Array.from(markers), to }
            : { command, mode, polygonPoints: Array.from(polygonPoints), to };

        const message = JSON.stringify(dataToSend);

        if (this.ws.readyState === WebSocket.OPEN) {
            console.log("📤 Gửi dữ liệu thành công");
            this.ws.send(message);
        }
    };
}

export const webSocketClient = new WebSocketClientWrapper('wss://drone-socket.onrender.com:443')