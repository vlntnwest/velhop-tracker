const axios = require("axios");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function fetchStations() {
    const response = await axios.get("https://gbfs.nextbike.net/maps/gbfs/v2/nextbike_ae/fr/station_information.json");
    const stations = response.data.data.stations;

    for (const station of stations) {
        await prisma.station.upsert({
            where: { id: station.station_id },
            update: {
                name: station.name,
                lat: station.lat,
                lon: station.lon,
                capacity: station.capacity,
                lastApiUpdate: response.data.last_updated,
            },
            create: {
                id: station.station_id,
                name: station.name,
                lat: station.lat,
                lon: station.lon,
                capacity: station.capacity,
                lastApiUpdate: response.data.last_updated,
            }
        });
    }

}

async function fetchStationsStatus() {
     const response = await axios.get("https://gbfs.nextbike.net/maps/gbfs/v2/nextbike_ae/fr/station_status.json");
    const stationsStatus = response.data.data.stations;

    const stations = await prisma.station.findMany({ include: { snapshots: { take: 1, orderBy: { ts: 'desc' } } } });

    for (const status of stationsStatus) {
        const station = stations.find((s) => s.id === status.station_id);
        
        if (!station) {
            continue;
        }
        if (station.snapshots[0]?.lastApiUpdate === status.last_reported) {
            continue;
        }
        if (station.snapshots[0]?.numBikesAvailable === status.num_bikes_available && station.snapshots[0]?.numDocksAvailable === status.num_docks_available) {
            console.log("Same as last snapshot");
            continue;
        }
        console.log("New snapshot");
         await prisma.snapshot.create({
            data: {
                stationId: status.station_id,
                ts: new Date(),
                numBikesAvailable: status.num_bikes_available,
                numDocksAvailable: status.num_docks_available,
                lastApiUpdate: status.last_reported
            }
        })
    }
}

  




async function main() {
    try {
        await fetchStations();
        await fetchStationsStatus();
    } catch(e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
