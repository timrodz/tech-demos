import { z } from 'zod';

export const cabinClassSchema = z.enum([
  'Economy',
  'Premium Economy',
  'Business',
  'First'
]);

export const seatPreferenceSchema = z.enum([
  'Window',
  'Aisle',
  'No preference'
]);

export const itinerarySchema = z.object({
  destination: z.string().min(1),
  outboundDate: z.string().min(1),
  returnDate: z.string().min(1),
  cabinClass: cabinClassSchema,
  passengers: z.number().int().positive(),
  seatPreference: seatPreferenceSchema,
  totalPriceNzd: z.number().nonnegative(),
  confirmationCode: z.string().min(1)
});

export const partialItinerarySchema = itinerarySchema.partial();

export const FIELD_KEYS = Object.keys(itinerarySchema.shape);

export const FIELD_META = {
  destination: { label: 'Destination' },
  outboundDate: { label: 'Outbound' },
  returnDate: { label: 'Return' },
  cabinClass: { label: 'Cabin' },
  passengers: { label: 'Passengers' },
  seatPreference: { label: 'Seat' },
  totalPriceNzd: { label: 'Total (NZD)' },
  confirmationCode: { label: 'Confirmation' }
};

export function hydratePartial(input) {
  const parsed = partialItinerarySchema.safeParse(input);
  const base = parsed.success ? { ...parsed.data } : {};

  if (!input || typeof input !== 'object') {
    return base;
  }

  for (const key of FIELD_KEYS) {
    if (!(key in input) || key in base) continue;
    const value = input[key];
    if (typeof value === 'string' && value.length > 0) {
      base[key] = value;
    } else if (typeof value === 'number' && Number.isFinite(value)) {
      base[key] = value;
    }
  }

  return base;
}
