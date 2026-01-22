import * as z from 'zod';

export const cardSchema = z.object({
  cardNumber: z
    .string()
    .regex(/^\d{4} \d{4} \d{4} \d{4}$/, "Card number must be 16 digits (xxxx xxxx xxxx xxxx)"),
  holderName: z
    .string()
    .regex(/^[a-zA-Z\s]+$/, "Full name must contain letters only")
    .min(2, "Name is too short"),
  expiryDate: z
    .string()
    .regex(/^(0[1-9]|1[0-2])\/?([0-9]{2})$/, "Expiry must be MM/YY"),
  cvv: z
    .string()
    .regex(/^\d{3}$/, "CVV must be exactly 3 numbers"),
  cardImage: z.string().optional(),
});

export type CardFormData = z.infer<typeof cardSchema>;