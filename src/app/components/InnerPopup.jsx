import { Button } from "@/components/ui/button";
import { useMapContext } from "./context/MapContext";
import { useMap } from "react-leaflet";

const InnerPopup = ({ station }) => {
  const { fetchBikeHistoric } = useMapContext();
  const map = useMap();

  const handleClick = async (bikeId) => {
    map.closePopup();
    await fetchBikeHistoric(bikeId);
  };

  return (
    <div>
      <h3>{station.name}</h3>
      <p>{station.snapshots[0]?.numBikesAvailable} vélos disponibles</p>
      {station.snapshots[0]?.bikeAtStation.map((bike) => (
        <Button
          key={bike.bikeId}
          variant="link"
          onClick={() => handleClick(bike.bikeId)}
        >
          {bike.bikeId}
        </Button>
      ))}
    </div>
  );
};

export default InnerPopup;
