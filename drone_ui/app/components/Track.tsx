// app/Track.tsx
'use client';
import React from "react";
import Image from "next/image";
import { useWebSocketImage } from "../../hooks/hookWebsocketImage"; // <-- dùng hook

const Track: React.FC = () => {
  const { imageSrc } = useWebSocketImage("ws://localhost:4000");

  return (
    <div className="rounded-lg">
      <h2 className="text-lg font-semibold mb-2">Picture Display</h2>

      {imageSrc ? (
        <Image
          src={`data:image/jpeg;base64,${imageSrc}`}
          alt="Drone Snapshot"
          width={0}
          height={0}
          sizes="100vw"
          className="w-full h-auto rounded-lg"
        />
      ) : (
        <p className="text-gray-500">No image received</p>
      )}
    </div>
  );
};

export default Track;
