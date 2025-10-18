import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import axios from "axios";

const MapContext = createContext({});

export function useMapContext() {
  return useContext(MapContext);
}

export default function MapProvider({ children }) {
  const [stations, setStations] = useState([]);
  const [polylinesArray, setPolylinesArray] = useState([]);

  // Fetch station lat and lng
  const fetchStationLatLong = useCallback(async (stationIds) => {
    const latLngArray = await Promise.all(
      stationIds.map(async (stationId) => {
        const response = await axios.get(`/api/station-lat-lng/${stationId}`);
        return [response.data.lat, response.data.lng];
      })
    );
    return latLngArray;
  }, []);

  // Fetch stations
  useEffect(() => {
    const fetchStations = async () => {
      const response = await axios.get("/api/get-stations");
      setStations(response.data);
    };
    fetchStations();
  }, []);

  // Build polylines when stations change
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
  }, [stations, fetchStationLatLong]);

  return (
    <MapContext.Provider value={{ stations, polylinesArray }}>
      {children}
    </MapContext.Provider>
  );
}
