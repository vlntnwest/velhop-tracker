import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request) {
  try {
    const response = await prisma.station.findMany({
      include: {
        snapshots: {
          take: 1,
          orderBy: { createdAt: "desc" },
          include: {
            bikeAtStation: {
              include: {
                bike: {
                  include: {
                    bikeHistoric: {
                      orderBy: { createdAt: "desc" },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });
    return new Response(JSON.stringify(response), {
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}
