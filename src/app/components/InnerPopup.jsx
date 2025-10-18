import { Button } from "@/components/ui/button";

const InnerPopup = ({ station }) => {
  return (
    <div>
      <h3>{station.name}</h3>
      <p>{station.snapshots[0]?.numBikesAvailable} vélos disponibles</p>
      {station.snapshots[0]?.bikeAtStation.map((bike) => (
        <Button
          key={bike.bikeId}
          variant="link"
          onClick={() => console.log(bike.bikeId)}
        >
          {bike.bikeId}
        </Button>
      ))}
    </div>
  );
};

export default InnerPopup;
