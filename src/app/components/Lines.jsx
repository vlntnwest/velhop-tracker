import { Polyline } from "react-leaflet";

const Lines = ({ polylinesArray }) => {
  return (
    <>
      {polylinesArray.map((polyline, index) => (
        <Polyline
          key={index}
          positions={polyline}
          pathOptions={{ color: "var(--color-dark-green)" }}
        />
      ))}
    </>
  );
};

export default Lines;
