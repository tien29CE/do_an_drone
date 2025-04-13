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
        <TileLayer url={url} attribution={attribution} />
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
      </MapContainer>
    </div>
  );
};

export default Map;
