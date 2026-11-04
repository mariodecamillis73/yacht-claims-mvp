export const EQUIPMENT = [
  ["engine", "Engine"],
  ["genset", "Genset"],
  ["bowThruster", "Bow thruster"],
  ["sternThruster", "Stern thruster"],
  ["propellers", "Propeller(s)"],
  ["airConditioning", "Air conditioning"],
  ["watermaker", "Watermaker"],
] as const;
export const PAINTING = [
  ["hullPainting", "Hull painting system"],
  ["deckPainting", "Deck painting system"],
] as const;
export type EquipmentDetails = {
  brand: string;
  model: string;
  power: string;
  serialNumber: string;
};
export type PaintDetails = {
  brand: string;
  paintType: string;
  colorCode: string;
};
export type TechnicalProfile = {
  equipment: Record<string, EquipmentDetails>;
  painting: Record<string, PaintDetails>;
  customFields: {
    id: string;
    section: string;
    name: string;
    value: string;
    unit: string;
  }[];
};
export function emptyTechnicalProfile(): TechnicalProfile {
  return {
    customFields: [],
    equipment: Object.fromEntries(
      EQUIPMENT.map(([key]) => [
        key,
        { brand: "", model: "", power: "", serialNumber: "" },
      ]),
    ),
    painting: Object.fromEntries(
      PAINTING.map(([key]) => [
        key,
        { brand: "", paintType: "", colorCode: "" },
      ]),
    ),
  };
}
// UTC calendar anniversary; 29 February expires on 28 February in non-leap years.
export function warrantyExpiry(delivery: string, years: number): string {
  const date = new Date(delivery + "T00:00:00.000Z");
  if (
    !Number.isFinite(date.getTime()) ||
    date.toISOString().slice(0, 10) !== delivery ||
    ![1, 2].includes(years)
  )
    return "";
  const month = date.getUTCMonth();
  date.setUTCFullYear(date.getUTCFullYear() + years);
  if (date.getUTCMonth() !== month) date.setUTCDate(0);
  return date.toISOString().slice(0, 10);
}
export function yachtResponse<T extends { equipmentJson: string }>(yacht: T) {
  const { equipmentJson, ...rest } = yacht;
  return {
    ...rest,
    technicalProfile: JSON.parse(equipmentJson) as TechnicalProfile,
  };
}
