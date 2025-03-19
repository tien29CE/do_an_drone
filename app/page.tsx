"use client";

import Image from "next/image";
import dynamic from "next/dynamic";

const Map = dynamic(() => import("./components/Map"), { ssr: false });
const Track = dynamic(() => import("./components/Track"))

export default function Home() {
  return (
    <div className="flex h-screen p-4 gap-4">
      <div className="w-2/3">
        <Map/>
      </div>
      <div className="w-1/3 flex flex-col items-center border-l border-gray-300 p-4">
        <Track/>
      </div>
    </div>
  );
}
