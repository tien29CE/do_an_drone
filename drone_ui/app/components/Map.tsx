'use client'

import React, {useEffect, useState } from "react";
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


const createDroneIcon = (rotation: number) => {
  return new L.DivIcon({
    className: "drone-marker",
    html: `<div style="
      width: 20px;
      height: 20px;
      background: url('/drone.svg') no-repeat center center;
      background-size: contain;
      transform: rotate(${rotation}deg);
    "></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
};


// Camera FOV & Resolution
const FOV_X = 66 * (Math.PI / 180); // Chuyển sang radian
const FOV_Y = 41 * (Math.PI / 180); // Chuyển sang radian

// Hàm tính toán chiều rộng và chiều cao vùng nhìn thấy trên mặt đất
const calculateViewArea = (lat:number, lng:number, altitude:number, heading:number) => {
  const W = 2 * altitude * Math.tan(FOV_X / 2);
  const H = 2 * altitude * Math.tan(FOV_Y / 2);

  // Convert width & height to degrees
  const halfW_deg = (W / 2) / (111320 * Math.cos(lat * Math.PI / 180));
  const halfH_deg = (H / 2) / 110574;

  // Convert heading to radians
  const theta = heading * (Math.PI / 180);
  const cosT = Math.cos(theta);
  const sinT = Math.sin(theta);

  // Calculate the four corners
  const corners = [
    [lat + halfH_deg * cosT - halfW_deg * sinT, lng + halfH_deg * sinT + halfW_deg * cosT], // Top-right
    [lat + halfH_deg * cosT + halfW_deg * sinT, lng + halfH_deg * sinT - halfW_deg * cosT], // Top-left
    [lat - halfH_deg * cosT + halfW_deg * sinT, lng - halfH_deg * sinT - halfW_deg * cosT], // Bottom-left
    [lat - halfH_deg * cosT - halfW_deg * sinT, lng - halfH_deg * sinT + halfW_deg * cosT], // Bottom-right
  ];

  return corners;
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
  const [mode, setMode] = useState<"marker" | "polygon">("marker");
  const [markers, setMarkers] = useState<{ lat: number; lng: number }[]>([]);
  const [polygonPoints, setPolygonPoints] = useState<[number, number][]>([]);
  
  const { recieveData } = useWebSocketImage("ws://localhost:4000");

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
      mode,
      markers,
      polygonPoints
    };
  
    axios.post("http://localhost:3000/api/send", data);

    console.log("📤 Gửi dữ liệu thành công");
  };


  return (
    <div className="relative">
      {/* Buttons (Bottom Right - Stacked) */}
      <div className="absolute bottom-4 right-4 z-[1000] bg-white p-2 rounded shadow-md flex flex-col space-y-2">
        <button
          className={`px-4 py-2 rounded ${
            mode === "marker" ? "bg-blue-500 text-white" : "bg-gray-300"
          }`}
          onClick={() => setMode("marker")}
        >
          Add Markers
        </button>
        <button
          className={`px-4 py-2 rounded ${
            mode === "polygon" ? "bg-blue-500 text-white" : "bg-gray-300"
          }`}
          onClick={() => setMode("polygon")}
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

        {recieveData && recieveData.lat && recieveData.lon && (
          <>
            {/* Drone Marker */}
            <Marker
              position={[recieveData.lat, recieveData.lon]}
              icon={createDroneIcon(recieveData.heading)}
            />

            {/* Camera View Box (FOV) */}
            <Polygon
            positions={calculateViewArea(
              recieveData.lat,
              recieveData.lon,
              recieveData.altitude || 50,
              recieveData.heading || 0
            ) as [number, number][]}
            pathOptions={{ color: "blue", weight: 2 }}
          />
          </>
        )}

      </MapContainer>
    </div>
  );
};

export default Map;
