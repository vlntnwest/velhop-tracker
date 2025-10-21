const axios = require("axios");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient({
  log: ["info", "warn", "error"],
});

async function getNextbikeData() {
  const response = await axios.get(
    "https://api.nextbike.net/maps/nextbike-live.json"
  );
  const data = response.data;
  return data.countries.find((c) => c.domain === "ae");
}

async function upsertStation(place) {
  return prisma.station.upsert({
    where: { stationId: place.uid },
    update: {
      name: place.name,
      lat: place.lat,
      lng: place.lng,
      capacity: place.bike_racks,
    },
    create: {
      stationId: place.uid,
      name: place.name,
      lat: place.lat,
      lng: place.lng,
      capacity: place.bikes,
      updatedAt: new Date(),
    },
  });
}

async function createSnapshotIfChanged(station, place) {
  const lastSnapshot = station.snapshots?.[0];
  if (
    lastSnapshot?.numBikesAvailable === place.bikes_available_to_rent &&
    lastSnapshot?.numDocksAvailable === place.free_racks
  )
    return;

  await prisma.snapshot.create({
    data: {
      stationId: place.uid,
      numBikesAvailable: place.bikes_available_to_rent,
      numDocksAvailable: place.free_racks,
      bikeAtStation: {
        create: place.bike_numbers.map((b) => ({
          stationId: place.uid,
          bike: {
            connectOrCreate: {
              where: { bikeId: b },
              create: { bikeId: b },
            },
          },
        })),
      },
    },
  });
}

async function processBike(bike, lastMap, stationId) {
  await prisma.bike.upsert({
    where: { bikeId: bike },
    update: { updatedAt: new Date() },
    create: {
      bikeId: bike,
      createdAt: new Date(),
    },
  });

  const last = lastMap.get(bike);

  if (last && last.stationId === stationId) return;

  console.log("Movement from", last?.stationId, "to", stationId);
  await prisma.bikeHistoric.create({
    data: {
      bikeId: bike,
      stationId: stationId,
    },
  });
}

async function fetchStationsAndBikes(velhopData) {
  const stations = await prisma.station.findMany({
    include: { snapshots: { take: 1, orderBy: { createdAt: "desc" } } },
  });
  const bikesWithHistorics = await prisma.bike.findMany({
    include: { bikeHistoric: true },
  });

  const lastMap = new Map();

  bikesWithHistorics.forEach((bike) => {
    const sortedHistorics = bike.bikeHistoric.sort(
      (a, b) => b.createdAt - a.createdAt
    );

    lastMap.set(bike.bikeId, sortedHistorics[0]);
  });

  for (const city of velhopData.cities) {
    for (const place of city.places) {
      const station = stations.find((s) => s.stationId === place.uid);

      await upsertStation(place);
      if (station) await createSnapshotIfChanged(station, place);

      for (const bike of place.bike_numbers) {
        await processBike(bike, lastMap, place.uid);
      }
    }
  }
}

async function main() {
  try {
    const velhopData = await getNextbikeData();
    await fetchStationsAndBikes(velhopData);
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error);

process.on("SIGINT", async () => {
  console.log("Shutting down, disconnecting prisma…");
  await prisma.$disconnect();
  process.exit(0);
});
