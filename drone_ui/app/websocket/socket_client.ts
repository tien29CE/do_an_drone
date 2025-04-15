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
        // Bạn có thể gửi tin nhắn ngay khi kết nối thành công, nếu cần
        // this.send("Hello from client!");
        });

        this.ws.on("message", (data: WebSocket.Data) => {
        // Xử lý tin nhắn nhận được
        // console.log("📥 Received:", data.toString());
        let recieveData : ReceiveData = JSON.parse(data.toString());
        if (recieveData.command === "Display drone data realtime" && recieveData.image !== null) {
            imageSrc = recieveData.image; // Giả sử hình ảnh được gửi dưới dạng base64 string
        } else {
            console.log("No image received");
        }
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

export const webSocketClient = new WebSocketClientWrapper('ws://localhost:4000')