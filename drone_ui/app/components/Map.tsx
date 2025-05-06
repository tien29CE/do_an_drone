'use client'

import React, { useState } from "react";
import L from "leaflet";
import {
  MapContainer,
  TileLayer,
  Marker,
  Polygon,
  useMapEvents,
} from "react-leaflet";
import markerIconPng from "leaflet/dist/images/marker-icon.png";
import markerShadowPng from "leaflet/dist/images/marker-shadow.png";
import "leaflet/dist/leaflet.css";
import axios from "axios";
import { useWebSocketImage } from "../../hooks/hookWebsocket"; // <-- dùng hook
import { useMemo } from "react";

const createDroneIcon = (rotation: number) => {
  return new L.DivIcon({
    className: "drone-marker",
    html: `<div style="
      width: 50px;
      height: 50px;
      background: url('/drone.svg') no-repeat center center;
      background-size: contain;
      transform: rotate(${rotation}deg);
    "></div>`,
    iconSize: [50, 50],
    iconAnchor: [25, 25],
  });
};

const createWaypointIcon = (index: number) => {
  return new L.DivIcon({
    className: "waypoint-icon",
    html: `<div style="
      background: #6a0dad;
      color: white;
      font-size: 14px;
      font-weight: bold;
      width: 28px;
      height: 28px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px solid white;
      box-shadow: 0 0 4px rgba(0,0,0,0.5);
    ">${index + 1}</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
};

// Hàm tính toán chiều rộng và chiều cao vùng nhìn thấy trên mặt đất
const calculateViewArea = (lat: number, lng: number, altitude: number, heading: number) => {
  // Camera FOV & Resolution
  const FOV_X = 66 / 180 * Math.PI; // Chuyển sang radian
  const FOV_Y = 41 / 180 * Math.PI; // Chuyển sang radian

  // Ground footprint in meters
  const W = 1.5 * altitude * Math.tan(FOV_X / 2);
  const H = 1.5 * altitude * Math.tan(FOV_Y / 2);

  // Tính góc quay (heading) về radian
  const theta = -heading * Math.PI / 180;

  // Tạo các đỉnh hình chữ nhật (trung tâm tại 0,0 trước khi quay)
  const corners = [
    [-W / 2, H / 2],   // top-left
    [W / 2, H / 2],    // top-right
    [W / 2, -H / 2],   // bottom-right
    [-W / 2, -H / 2],  // bottom-left
  ];

  // Hàm chuyển từ mét sang độ (theo latitude & longitude)
  const meterToLat = (m: number) => m / 110574;
  const meterToLng = (m: number) => m / (111320 * Math.cos(lat * Math.PI / 180));

  // Quay và dịch các điểm theo heading
  const rotated = corners.map(([x, y]) => {
    const xr = x * Math.cos(theta) - y * Math.sin(theta);
    const yr = x * Math.sin(theta) + y * Math.cos(theta);
    return [
      lat + meterToLat(yr),
      lng + meterToLng(xr)
    ];
  });

  return rotated;
};


// Custom icon for regular markers
const markerIcon = new L.Icon({
  iconUrl: markerIconPng,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: markerShadowPng,
  shadowSize: [41, 41],
});

// Custom icon for shape points (red circles)
const shapePointIcon = new L.DivIcon({
  className: "custom-shape-marker",
  html: `<div style="
    width: 15px;
    height: 15px;
    background: red;
    border: 2px solid white;
    border-radius: 50%;
    box-shadow: 0 0 5px rgba(0,0,0,0.5);
  "></div>`,
  iconSize: [15, 15],
  iconAnchor: [7, 7],
});

const url = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
const attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

const Map: React.FC = () => {
  const [command, setCommand] = useState<"Follow markers" | "Calculate waypoints">("Follow markers");
  const [mode, setMode] = useState<"marker" | "polygon">("marker");
  const [markers, setMarkers] = useState<{ lat: number; lng: number }[]>([]);
  const [polygonPoints, setPolygonPoints] = useState<[number, number][]>([]);
  
  const { receiveData, imageSrc, wayPoints } = useWebSocketImage("wss://drone-socket.onrender.com:443");

  // Click event handler to add markers or shape points
  const MapClickHandler = () => {
    useMapEvents({
      click: (e) => {
        const { lat, lng } = e.latlng;

        if (mode === "marker") {
          setMarkers((prevMarkers) => [...prevMarkers, { lat, lng }]);
        } else if (mode === "polygon") {
          setPolygonPoints((prevPoints) => [...prevPoints, [lat, lng]]);
        }
      },
    });
    return null;
  };

  // Function to remove a marker when clicked
  const handleMarkerClick = (index: number) => {
    setMarkers((prevMarkers) => prevMarkers.filter((_, i) => i !== index));
  };

  // Function to update polygon points when a shape point is dragged
  const handleDragEnd = (index: number, event: L.LeafletEvent) => {
    const { lat, lng } = event.target.getLatLng();
    setPolygonPoints((prevPoints) =>
      prevPoints.map((point, i) => (i === index ? [lat, lng] : point))
    );
  };

  // Function to reset the polygon
  const resetPolygon = () => {
    setPolygonPoints([]);
  };

  const handleSend = async () => {
    const data = {
      command,
      mode,
      markers,
      polygonPoints
    };
  
    axios.post("/api/send", data);

    console.log("📤 Gửi dữ liệu thành công");
  };

  const waypointMarkers = useMemo(() => {
    if (!wayPoints) return null;
  
    return wayPoints.map(([lat, lon]: [number, number], index: number) => (
      <Marker
        key={`wp-${index}`}
        position={[lat, lon]}
        icon={createWaypointIcon(index)}
      />
    ));
  }, [wayPoints]);
  
  const waypointPolygon = useMemo(() => {
    if (!wayPoints) return null;
  
    return (
      <Polygon
        positions={wayPoints}
        color="yellow"
        weight={3}
        dashArray="5"
      />
    );
  }, [wayPoints]);

  return (
    <div className="relative">
      {/* Buttons (Bottom Right - Stacked) */}
      <div className="absolute bottom-4 right-4 z-[1000] bg-white p-2 rounded shadow-md flex flex-col space-y-2">
        <button
          className={`px-4 py-2 rounded ${
            mode === "marker" ? "bg-blue-500 text-white" : "bg-gray-300"
          }`}
          onClick={() => {
            setMode("marker");
            setCommand("Follow markers");
          }}
        >
          Add Markers
        </button>
        <button
          className={`px-4 py-2 rounded ${
            mode === "polygon" ? "bg-blue-500 text-white" : "bg-gray-300"
          }`}
          onClick={() => {
            setMode("polygon");
            setCommand("Calculate waypoints");
          }}
        >
          Draw Shape
        </button>
        <button
          className="px-4 py-2 bg-red-500 text-white rounded"
          onClick={resetPolygon}
        >
          Reset Shape
        </button>
        <button
          className={`px-4 py-2 rounded ${
            ((mode === "marker" && markers.length > 0) || (mode === "polygon" && polygonPoints.length > 0))
              ? "bg-green-500 text-white"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        onClick={handleSend}
        >
          Send data to process
        </button>
      </div>

      {/* Leaflet Map */}
      <MapContainer
        center={[10.7769, 106.7009]}
        zoom={13}
        className="h-[100vh] rounded-lg"
      >
        <TileLayer url={url} attribution={attribution} maxZoom={19}/>
        <MapClickHandler />

        {/* Regular Markers */}
        {markers.map((marker, index) => (
          <Marker
            key={index}
            position={[marker.lat, marker.lng]}
            icon={markerIcon}
            eventHandlers={{
              click: () => handleMarkerClick(index),
            }}
          />
        ))}

        {/* Shape Points (Draggable) */}
        {polygonPoints.map((point, index) => (
          <Marker
            key={`shape-${index}`}
            position={point}
            icon={shapePointIcon}
            draggable={true}
            eventHandlers={{
              dragend: (event) => handleDragEnd(index, event),
            }}
          />
        ))}

        {/* Polygon (Only renders if 4 points exist) */}
        {polygonPoints.length >= 2 && (
          <Polygon positions={polygonPoints} color="purple" />
        )}

        {receiveData && receiveData?.lat && receiveData?.lon && (
          <>
            {/* Drone Marker */}
            <Marker
              position={[receiveData.lat, receiveData.lon]}
              icon={createDroneIcon(receiveData.heading)}
            />

            {/* Camera View Box (FOV) */}
            <Polygon
              positions={calculateViewArea(
                receiveData.lat,
                receiveData.lon,
                receiveData.altitude || 0,
                receiveData.heading || 0
              ) as [number, number][]}
              pathOptions={{ color: "blue", weight: 2 }}
            />
          </>
        )}

        {waypointPolygon}
        {waypointMarkers}
      </MapContainer>
    </div>
  );
};

export default Map;
