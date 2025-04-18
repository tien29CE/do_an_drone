'use client';

import React from "react";
import Image from "next/image";
import { useWebSocketImage } from "../../hooks/hookWebsocket"; // <-- dùng hook
import { BatteryIndicator } from "@/app/components/BatteryIndicator"; // <-- dùng hook
import { useMemo } from "react";

const Track: React.FC = () => {
  const { receiveData, imageSrc } = useWebSocketImage("ws://localhost:4000");

  const batteryDisplay = useMemo(() => {
    if (!receiveData || !receiveData.battery ) return null;
  
    return (
      <div className="w-full flex justify-center mt-4">
        <div className="flex items-center justify-between w-[400px] p-3 rounded-md shadow-md bg-cyan-700">
          <h3 className="text-2xl font-semibold text-white">Battery Status:</h3>
          <div className="flex items-center space-x-1 bg-white rounded-md px-3 py-2 shadow scale-110">
            <div className="scale-125">
              <BatteryIndicator battery={receiveData.battery} />
            </div>
            <span className="font-semibold text-cyan-800 text-lg">{receiveData.battery}%</span>
          </div>
        </div>
      </div>
    );
  }, [receiveData?.battery]);

  return (
      <div>
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
        {batteryDisplay}
      </div>
  );
};

export default Track;
