"use client";
import axios from "axios";
import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import Lines from "./Lines";

export default function Map() {
  const position = [48.611639, 7.742056];
  const [mounted, setMounted] = useState(false);
  const [stations, setStations] = useState([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const fetchStations = async () => {
      const response = await axios.get("/api/get-stations");
      setStations(response.data);
    };
    fetchStations();
  }, []);

  if (!mounted) return null;

  return (
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
          >
            <Popup>
              <h3>{station.name}</h3>
              <p>{station.snapshots[0]?.numBikesAvailable} vélos disponibles</p>
              <p>
                {station.snapshots[0]?.bikeAtStation
                  .map((bike) => bike.bikeId)
                  .join(", ")}
              </p>
            </Popup>
          </CircleMarker>
        ))}
        <Lines stations={stations} />
      </MapContainer>
    </div>
  );
}
