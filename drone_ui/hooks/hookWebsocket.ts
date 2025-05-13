'use client';
import { useEffect, useState } from "react";

export interface ReceiveData {
  name: string;
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
  to: string;
}

export const useWebSocketImage = (url: string) => {
  const [receiveData, setReceiveData] = useState<ReceiveData | null>(null);
  const [imageSrc, setImageSrc] = useState<string>("");
  const [wayPoints, setWayPoints] = useState<any>(null);

  useEffect(() => {
    const ws = new WebSocket(url);

    ws.onopen = () => {
      console.log("✅ Connected to WebSocket");
      const registerData = {
        command: "registry",
        name: "frontend"
      };
      ws.send(JSON.stringify(registerData));
    };

    ws.onmessage = (event) => {
      try {
        const data: ReceiveData = JSON.parse(event.data);
        if (!data.image && !data.wayPoints) {
          console.log("📥 Received at data:", data);
          setReceiveData(data);
          return;
        }

        if (data.image && !data.wayPoints  && data.image !== "") {
          console.log("📥 Received at image:", data);
          setImageSrc(data.image);
          return;
        }

        if (data.wayPoints && data.wayPoints.length > 0) {
          console.log("📥 Received at wayPoints:", data);
          setWayPoints(data.wayPoints);
        }
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

  return { receiveData, imageSrc, wayPoints };
};