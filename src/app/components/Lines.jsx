import { Polyline } from "react-leaflet";
import { useMapContext } from "./context/MapContext";
import { useEffect, useState } from "react";

const Lines = () => {
  const { polylinesArray, bikeHistoric } = useMapContext();
  const [bikeHistoricPosition, setBikeHistoricPosition] = useState([]);

  useEffect(() => {
    let bikeHistoricPosition = [];
    bikeHistoric.forEach((historic) => {
      const lat = historic.station.lat;
      const lng = historic.station.lng;
      bikeHistoricPosition.push([lat, lng]);
    });
    setBikeHistoricPosition(bikeHistoricPosition);
  }, [bikeHistoric]);

  return (
    <>
      {polylinesArray.map((polyline, index) => (
        <Polyline
          key={index}
          positions={polyline}
          pathOptions={{ color: "var(--color-dark-green)" }}
        />
      ))}
      {bikeHistoricPosition.length > 0 && (
        <Polyline
          positions={bikeHistoricPosition}
          pathOptions={{ color: "red" }}
        />
      )}
    </>
  );
};

export default Lines;
