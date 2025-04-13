'use client';
import { useEffect, useState } from "react";

export interface ReceiveData {
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
  image: string;
  wayPoints: any;
}

export const useWebSocketImage = (url: string) => {
  const [recieveData, setRecieveData] = useState<ReceiveData | null>(null);

  useEffect(() => {
    const ws = new WebSocket(url);

    ws.onopen = () => {
      console.log("✅ Connected to WebSocket");
    };

    ws.onmessage = (event) => {
      try {
        const data: ReceiveData = JSON.parse(event.data);
        setRecieveData(data);
      } catch (err) {
        console.error("❌ Error parsing WebSocket data", err);
      }
    };

    ws.onclose = () => {
      console.log("❌ WebSocket disconnected");
    };

    ws.onerror = (err) => {
      console.error("⚠️ WebSocket error:", err);
    };

    return () => ws.close();
  }, [url]);

  return { recieveData };
};