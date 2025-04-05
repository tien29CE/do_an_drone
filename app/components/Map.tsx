"use client";

import React, { useState, useEffect } from "react";
import L from "leaflet";
import { Popup } from "react-leaflet";
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
import { Console } from "console";

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

// const url = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"; 
const url = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";


const attribution =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';


// Create a rotatable drone icon
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
const calculateViewArea = (lat, lng, altitude, heading) => {
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

// Component ViewArea để vẽ vùng nhìn thấy
const ViewArea = ({ drone }: { drone: any }) => {
  const viewArea = calculateViewArea(drone.lat, drone.lng, drone.altitude, drone.heading);
  return <Polygon positions={viewArea} color="blue" />;
};


const Map: React.FC = () => {
  const [mode, setMode] = useState<"marker" | "polygon">("marker");
  const [markers, setMarkers] = useState<{ lat: number; lng: number }[]>([]);
  const [polygonPoints, setPolygonPoints] = useState<[number, number][]>([]);

  const [drone, setDrone] = useState({
    lat: 10.7769,
    lng: 106.7009,
    heading: 0,
    altitude: 30, // Độ cao drone (m)
  });

  
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState<string | null>(null); // Error state

  // Load drone data from JSON
  useEffect(() => {
    const fetchDroneData = async () => {
      try {
        const response = await fetch("/drone_data.json");
        if (!response.ok) throw new Error("Failed to load drone data");
        const data = await response.json();
        setDrone(data); // Update drone data
        setLoading(false); // Data successfully loaded
      } catch (error) {
        setError("Error loading drone data: " + error.message); // Set error message
        setLoading(false); // Data loading completed with an error
      }
    };

    fetchDroneData();
    const interval = setInterval(fetchDroneData, 1000); // Update every 1000ms
    return () => clearInterval(interval);
  }, []);


  // Click event handler to add markers or shape points
  const MapClickHandler = () => {
    useMapEvents({
      click: (e) => {
        const { lat, lng } = e.latlng;

        if (mode === "marker") {
          setMarkers((prevMarkers) => [...prevMarkers, { lat, lng }]);
        } else if (mode === "polygon") {
          if (polygonPoints.length < 4) {
            setPolygonPoints((prevPoints) => [...prevPoints, [lat, lng]]);
          } else {
            alert("You can only select 4 points to create a shape.");
          }
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

  // Handle loading and error states
  if (loading) {
    return <div>Loading drone data...</div>; // Show a loading message while fetching data
  }

  if (error) {
    return <div>{error}</div>; // Show an error message if there was an issue fetching the data
  }

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
      </div>

      {/* Leaflet Map */}
      <MapContainer
        center={[drone.lat, drone.lng]}
        zoom={15}
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
        {polygonPoints.length === 4 && (
          <Polygon positions={polygonPoints} color="purple" />
        )}

      <Marker position={[drone.lat, drone.lng]} icon={createDroneIcon(drone.heading)}>
        <Popup>
          📍 <b>Drone Position:</b> <br />
          Latitude: {drone.lat.toFixed(6)} <br />
          Longitude: {drone.lng.toFixed(6)} <br />
          Heading: {drone.heading}° <br />
          Altitude: {drone.altitude} m
        </Popup>
      </Marker>
      <ViewArea drone={drone} />
      </MapContainer>
    </div>
  );
};

export default Map;
