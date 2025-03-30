import Map from "./components/Map";
import Track from "./components/Track";
import START from '@/app/api/start/start'

export default function Home() {
  START()

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
