// src/lib/siteConfig.ts
import { prisma } from "./db";

export type SpecialHours = {
  date: string;
  hours: string;
};

export type WeekendHours = {
  saturday: string; // "CLOSED" or "HH:MM-HH:MM"
  sunday: string;
};

export type SiteConfig = {
  enableSameDayService: boolean;
  holidays: string[];
  specialHours: SpecialHours[];
  weekdaySlotInterval: number;
  weekendSlotInterval: number;
  weekendHours: WeekendHours;
  excludedNationalities: string[];
};

// Calling-visa / restricted-nationality countries that must be blocked in AURORA and
// routed to a guarantor/sponsor in Indonesia instead. This list is a placeholder for
// the three countries explicitly named in the AURORA spec (Iran, Yemen, Bangladesh) —
// the full/final calling-visa list still needs confirmation from the consular team,
// and can be edited via whatever admin tool manages `excludedNationalities`.
const DEFAULT_EXCLUDED_NATIONALITIES = ["Iran", "Yemen", "Bangladesh"];

const DEFAULT_CONFIG: SiteConfig = {
  enableSameDayService: false,
  holidays: [],
  specialHours: [],
  weekdaySlotInterval: 30,
  weekendSlotInterval: 15,
  weekendHours: { saturday: "CLOSED", sunday: "CLOSED" },
  excludedNationalities: DEFAULT_EXCLUDED_NATIONALITIES,
};

export async function getSiteConfig(): Promise<SiteConfig> {
  const row = await prisma.siteConfig.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, ...DEFAULT_CONFIG },
  });

  return {
    enableSameDayService: row.enableSameDayService,
    holidays: row.holidays as string[],
    specialHours: row.specialHours as SpecialHours[],
    weekdaySlotInterval: (row as any).weekdaySlotInterval ?? 30,
    weekendSlotInterval: (row as any).weekendSlotInterval ?? 15,
    weekendHours: (row as any).weekendHours ?? { saturday: "CLOSED", sunday: "CLOSED" },
    excludedNationalities: ((row as any).excludedNationalities as string[]) ?? [],
  };
}

export async function saveSiteConfig(next: SiteConfig): Promise<void> {
  const holidays = Array.from(new Set(next.holidays || []))
    .map((s) => s.trim())
    .filter((s) => /^\d{4}-\d{2}-\d{2}$/.test(s))
    .sort();

  const specialHoursMap = new Map<string, string>();
  for (const item of next.specialHours || []) {
    const date = item.date.trim();
    const hours = item.hours.trim().toUpperCase();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) continue;
    if (hours !== "CLOSED" && !/^([01]\d|2[0-3]):[0-5]\d-([01]\d|2[0-3]):[0-5]\d$/.test(hours)) continue;
    specialHoursMap.set(date, hours);
  }

  const specialHours = Array.from(specialHoursMap.entries())
    .map(([date, hours]) => ({ date, hours }))
    .sort((a, b) => a.date.localeCompare(b.date));

  const weekdaySlotInterval = typeof next.weekdaySlotInterval === "number"
    && [15, 20, 30, 60].includes(next.weekdaySlotInterval)
    ? next.weekdaySlotInterval : 30;
  const weekendSlotInterval = typeof next.weekendSlotInterval === "number"
    && [15, 20, 30, 60].includes(next.weekendSlotInterval)
    ? next.weekendSlotInterval : 15;

  const isValidHours = (s: string) =>
    s === "CLOSED" || /^([01]\d|2[0-3]):[0-5]\d-([01]\d|2[0-3]):[0-5]\d$/.test(s);

  const weekendHours: WeekendHours = {
    saturday: isValidHours(next.weekendHours?.saturday ?? "") ? next.weekendHours.saturday : "CLOSED",
    sunday: isValidHours(next.weekendHours?.sunday ?? "") ? next.weekendHours.sunday : "CLOSED",
  };

  await (prisma as any).siteConfig.upsert({
    where: { id: 1 },
    update: { enableSameDayService: !!next.enableSameDayService, holidays, specialHours, weekdaySlotInterval, weekendSlotInterval, weekendHours },
    create: { id: 1, enableSameDayService: !!next.enableSameDayService, holidays, specialHours, weekdaySlotInterval, weekendSlotInterval, weekendHours },
  });
}