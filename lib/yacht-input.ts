import { z } from "zod";
import { HttpError } from "@/lib/auth";
import { EQUIPMENT, PAINTING, warrantyExpiry } from "@/lib/yacht-profile";
const text = z.string().trim().max(200).default("");
const equipment = z
  .object({ brand: text, model: text, power: text, serialNumber: text })
  .strict();
const propeller = z
  .object({
    brand: text,
    model: text,
    serialNumber: text,
    power: z.literal("").default(""),
  })
  .strict();
const paint = z
  .object({ brand: text, paintType: text, colorCode: text })
  .strict();
const technicalProfile = z
  .object({
    customFields: z
      .array(
        z
          .object({
            id: z.string().min(1).max(100),
            section: z
              .string()
              .refine((value) =>
                [...EQUIPMENT, ...PAINTING].some(([key]) => key === value),
              ),
            name: z.string().trim().min(1).max(100),
            value: z.string().max(1000),
            unit: z.string().max(50),
          })
          .strict(),
      )
      .max(100)
      .default([]),
    equipment: z
      .object(
        Object.fromEntries(
          EQUIPMENT.map(([key]) => [
            key,
            (key === "propellers" ? propeller : equipment).optional(),
          ]),
        ),
      )
      .strict()
      .default({}),
    painting: z
      .object(
        Object.fromEntries(PAINTING.map(([key]) => [key, paint.optional()])),
      )
      .strict()
      .default({}),
  })
  .strict()
  .optional();
export const yachtInput = z.object({
  hullNumber: z
    .string()
    .trim()
    .min(1)
    .max(50)
    .regex(/^[A-Za-z0-9][A-Za-z0-9._-]*$/)
    .transform((v) => v.toUpperCase()),
  name: z.string().trim().min(1).max(200),
  yearBuilt: z.number().int().min(1900).max(2200),
  deliveryDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  warrantyYears: z.union([z.literal(1), z.literal(2)]).optional(),
  technicalProfile,
  ownerId: z.string().trim().max(200).default(""),
  captainName: z.string().trim().max(200).default(""),
});
export function yachtData(input: z.infer<typeof yachtInput>) {
  const {
    technicalProfile: profile,
    deliveryDate,
    warrantyYears,
    ...base
  } = input;
  if (!!deliveryDate !== !!warrantyYears)
    throw new HttpError(
      400,
      "Delivery date and warranty duration must be supplied together",
    );
  const expiry = deliveryDate
    ? warrantyExpiry(deliveryDate, warrantyYears!)
    : "";
  if (deliveryDate && !expiry)
    throw new HttpError(400, "Invalid delivery date");
  return {
    ...base,
    equipmentJson: JSON.stringify(profile || {}),
    deliveryDate: deliveryDate
      ? new Date(deliveryDate + "T00:00:00.000Z")
      : null,
    warrantyYears: warrantyYears ?? null,
    warrantyExpiresAt: expiry ? new Date(expiry + "T00:00:00.000Z") : null,
  };
}
