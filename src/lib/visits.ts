// src/lib/visits.ts
import { prisma } from "./db";

export async function incrementVisits(): Promise<number> {
  const row = await prisma.visits.upsert({
    where: { id: 1 },
    update: { total: { increment: 1 } },
    create: { id: 1, total: 1 },
  });
  return row.total;
}

export async function getVisits(): Promise<number> {
  const row = await prisma.visits.findUnique({ where: { id: 1 } });
  return row?.total ?? 0;
}