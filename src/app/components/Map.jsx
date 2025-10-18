"use client";
import axios from "axios";
import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import Lines from "./Lines";
import InnerPopup from "./InnerPopup";
import { useMapContext } from "./context/MapContext";

export default function Map() {
  const position = [48.611639, 7.742056];
  const [mounted, setMounted] = useState(false);
  const { stations, polylinesArray } = useMapContext();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <>
      <h1 className="text-2xl text-dark-green uppercase font-bold">Map</h1>
      <div className="flex items-center justify-center w-full h-[75vh]">
        <MapContainer
          center={position}
          zoom={12}
          scrollWheelZoom={true}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {stations.map((station) => (
            <CircleMarker
              key={station.stationId}
              center={[station.lat, station.lng]}
              pathOptions={{ color: "var(--color-dark-green)" }}
            >
              <Popup>
                <InnerPopup station={station} />
              </Popup>
            </CircleMarker>
          ))}
          <Lines polylinesArray={polylinesArray} />
        </MapContainer>
      </div>
    </>
  );
}
