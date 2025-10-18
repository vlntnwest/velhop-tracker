import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request, { params }) {
  const { id } = await params;

  try {
    const response = await prisma.bike.findUnique({
      where: {
        bikeId: id,
      },
      include: {
        bikeHistoric: {
          orderBy: {
            createdAt: "desc",
          },
          include: {
            station: true,
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
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}
