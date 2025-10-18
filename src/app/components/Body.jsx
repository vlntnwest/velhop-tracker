"use client";

import dynamic from "next/dynamic";

const LazyMap = dynamic(() => import("./Map"), {
  ssr: false,
  loading: () => <p>Loading...</p>,
});

const Body = () => {
  return (
    <section className="flex flex-col w-full h-full items-center justify-center px-5">
      <h1 className="text-2xl font-bold">Map</h1>
      <LazyMap />
    </section>
  );
};

export default Body;
