const axios = require("axios");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function fetchStations() {
  const response = await axios.get(
    "https://gbfs.nextbike.net/maps/gbfs/v2/nextbike_ae/fr/station_information.json"
  );
  const stations = response.data.data.stations;

  for (const station of stations) {
    await prisma.station.upsert({
      where: { stationId: station.station_id },
      update: {
        name: station.name,
        lat: station.lat,
        lon: station.lon,
        capacity: station.capacity,
        lastApiUpdate: response.data.last_updated,
      },
      create: {
        stationId: station.station_id,
        name: station.name,
        lat: station.lat,
        lon: station.lon,
        capacity: station.capacity,
        lastApiUpdate: response.data.last_updated,
      },
    });
  }
}

async function fetchStationsStatus() {
  const response = await axios.get(
    "https://gbfs.nextbike.net/maps/gbfs/v2/nextbike_ae/fr/station_status.json"
  );
  const stationsStatus = response.data.data.stations;

  const stations = await prisma.station.findMany({
    include: { snapshots: { take: 1, orderBy: { apiUpdate: "desc" } } },
  });

  for (const status of stationsStatus) {
    const station = stations.find((s) => s.stationId === status.station_id);

    if (!station) {
      continue;
    }
    if (station.snapshots[0]?.apiUpdate === status.last_reported) {
      continue;
    }
    if (
      station.snapshots[0]?.numBikesAvailable === status.num_bikes_available &&
      station.snapshots[0]?.numDocksAvailable === status.num_docks_available
    ) {
      continue;
    }
    await prisma.snapshot.create({
      data: {
        stationId: status.station_id,
        numBikesAvailable: status.num_bikes_available,
        numDocksAvailable: status.num_docks_available,
        apiUpdate: status.last_reported,
      },
    });
  }
}

async function fetchBikes() {
  const response = await axios.get(
    "https://gbfs.nextbike.net/maps/gbfs/v2/nextbike_ae/fr/free_bike_status.json"
  );
  const bikes = response.data.data.bikes;
  const lastUpdated = response.data.last_updated;

  await Promise.all(
    bikes.map(async (bike) => {
      await prisma.bike.upsert({
        where: { bikeId: bike.bike_id },
        update: {
          lastSeenAt: response.data.last_updated,
        },
        create: {
          bikeId: bike.bike_id,
          createdAt: new Date(),
          lastSeenAt: response.data.last_updated,
        },
      });
    })
  );

  await Promise.all(
    bikes.map(async (bike) => {
      const lastHistoric = await prisma.bikeHistoric.findFirst({
        where: { bikeId: bike.bike_id },
        orderBy: { apiUpdate: "desc" },
      });

      if (
        lastHistoric?.apiUpdate === lastUpdated ||
        lastHistoric?.stationId === bike.station_id
      ) {
        return;
      }

      await prisma.bikeHistoric.create({
        data: {
          bikeId: bike.bike_id,
          stationId: bike.station_id,
          capturedAt: new Date(),
          apiUpdate: lastUpdated,
        },
      });
    })
  );
}

async function main() {
  try {
    await fetchStations();
    await fetchStationsStatus();
    await fetchBikes();
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
