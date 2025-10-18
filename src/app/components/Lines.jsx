import axios from "axios";
import { useEffect, useState } from "react";
import { Polyline } from "react-leaflet";

const Lines = ({ stations }) => {
  const [polylinesArray, setPolylinesArray] = useState([]);

  useEffect(() => {
    const buildPolylines = async () => {
      const tasks = [];
      stations.forEach((station) => {
        station.snapshots.forEach((snapshot) => {
          snapshot.bikeAtStation.forEach((bike) => {
            if (bike.bike.bikeHistoric.length <= 1) return;
            const stationIds = bike.bike.bikeHistoric.map(
              (bikeHistoric) => bikeHistoric.stationId
            );
            tasks.push(fetchStationLatLong(stationIds));
          });
        });
      });
      const results = await Promise.all(tasks);
      setPolylinesArray(results);
    };
    if (stations?.length) {
      buildPolylines();
    } else {
      setPolylinesArray([]);
    }
  }, [stations]);

  const fetchStationLatLong = async (stationIds) => {
    const latLngArray = await Promise.all(
      stationIds.map(async (stationId) => {
        const response = await axios.get(`/api/station-lat-lng/${stationId}`);
        return [response.data.lat, response.data.lng];
      })
    );
    return latLngArray;
  };

  console.log("polylinesArray", polylinesArray);

  return (
    <>
      {polylinesArray.map((polyline, index) => (
        <Polyline key={index} positions={polyline} />
      ))}
    </>
  );
};

export default Lines;
