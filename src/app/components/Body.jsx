"use client";
import dynamic from "next/dynamic";
import { Spinner } from "../../components/ui/shadcn-io/spinner";
import MapProvider from "./context/MapContext";

const LazyMap = dynamic(() => import("./Map"), {
  ssr: false,
  loading: () => <Spinner variant="ring" />,
});

const Body = () => {
  return (
    <section className="flex flex-col w-full h-full items-center justify-center px-5">
      <MapProvider>
        <LazyMap />
      </MapProvider>
    </section>
  );
};

export default Body;
