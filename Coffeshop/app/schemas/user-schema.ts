import * as z from "zod";

export const userSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().optional(),
  name: z
    .string()
    .min(5, "Full name is required")
    .regex(/^[a-zA-Z\s]*$/, "Name can only contain letters"),
    phone: z
    .string()
    .transform((val) => val.replace(/\s/g, "")) // 
    .pipe(
      z.string().regex(/^[0-9]{9}$/, "Phone must be exactly 9 digits")
    ),
  town: z
    .string()
    .min(3, "City is required")
    .regex(/^[a-zA-Z\s]*$/, "City can only contain letters"),
  zip: z
    .string()
    .regex(/^[0-9]{5,6}$/, "ZIP must be 5 or 6 digits"),
  street: z.string().min(5, "Street address is required"),
  landmark: z.string().optional(),
}).refine((data) => {
  if (data.confirmPassword !== undefined) {
    return data.password === data.confirmPassword;
  }
  return true;
}, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});


export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});



export type LoginFormData = z.infer<typeof loginSchema>;
export type UserFormData = z.infer<typeof userSchema>;