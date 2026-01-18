import { z } from 'zod';

export const paymentSchema = z.object({
  cardNumber: z
    .string()
    .regex(/^\d{4} \d{4} \d{4} \d{4}$/, "Enter 16 digits in xxxx xxxx xxxx xxxx format"),
  cardName: z
    .string()
    .min(1, "Name is required")
    .regex(/^[a-zA-Z\s]+$/, "Name must contain only letters"),
  expiry: z
    .string()
    .regex(/^(0[1-9]|1[0-2])\/\d{2}$/, "Use MM/YY format (e.g. 12/25)"),
  cvv: z
    .string()
    .length(3, "Enter exactly 3 numbers")
});

export type PaymentFormData = z.infer<typeof paymentSchema>;